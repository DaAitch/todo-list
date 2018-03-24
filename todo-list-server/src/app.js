import fs from 'fs';
import https from 'https';
import crypto from 'crypto';

import express from 'express';
import proxy from 'http-proxy-middleware';
import mongodb from 'mongodb';
import moment from 'moment';
import uuid from 'uuid';
import dotenv from 'dotenv';

import logawesomeMiddleware from './logawesome-express-middleware';
import MongoDB, { mongoToString, mongoToObjectId, mongoToNumber } from './MongoDB';
import { logSystem } from './log-system';
import { success, fail } from './rest';
import authHandler from './auth-handler';

import * as security from './security';




// read env
dotenv.config();






// process events

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('unhandledException', e => {
    console.error('Unhandled Exception: ', e);
});





// logging

const logger = logSystem.createLogger();
logger.set('coId', 'main');

logger `INFO` `starting todo list`;




// ssl
const sslOptions = {
    key: fs.readFileSync(process.env.TODOLIST_SSL_KEY),
    cert: fs.readFileSync(process.env.TODOLIST_SSL_CERT),
    passphrase: process.env.TODOLIST_SSL_PASSPHRASE
};





(async () => {

    // database

    const db = new MongoDB();

    const mongoUrl = process.env.TODOLIST_MONGO_URL || 'mongodb://localhost:27017';
    const mongoDb = process.env.TODOLIST_MONGO_DB || 'todolist';
    logger `INFO` `connect to mongo url ${{mongoUrl}}, db ${{mongoDb}}`;
    
    await db.connect(mongoUrl, mongoDb);



    // app

    const app = express();


    // middlewares

    app.use(logawesomeMiddleware(logSystem));
    app.use(express.json());
    

    const authenticated = authHandler(db);


    // routes

    /*
     * 
     */
    {
        const upSince = moment();

        app.get('/api/system/status', async (req, resp) => {
    
            const now = moment();
            resp.json(success({
                sanity: db.connected,
                uptime: {
                    text: upSince.from(now),
                    seconds: now.diff(upSince, 'seconds')
                },
                db: {
                    connected: db.connected
                }
            }));
        });
    }
    




    /*
     * 
     */
    app.post('/api/user/login', async (req, resp) => {

        const username = req.body && req.body.username;
        req.logger `INFO` `user login ${{username}}`;

        const user = await db.findUserByUsername(username);

        // no user found
        if (!user) {
            resp.json(fail.login());
            return;
        }

        const matches = await security.compareHash(
            req.body && req.body.password,
            Buffer.from(user.hash, 'base64') // hacky
        );

        if (!matches) {
            resp.json(fail.login());
            return;
        }

        const authToken = uuid.v4();
        await db.insertSession(user._id, authToken);

        resp.json(success({
            authToken
        }));
    });




    /*
     * 
     */
    app.post('/api/user/auth', authenticated(async ({req, resp, user}) => {
        resp.json(success({
            userId: mongoToString(user._id)
        }));
    }));





    /*
     * 
     */
    app.get('/api/user/:userId/todos', authenticated(async ({req, resp, user}) => {

        if (req.params.userId !== mongoToString(user._id)) {
            resp.json(fail.accessViolation());
            return;
        }
        
        const todos = await db.findTodosByUserId(mongoToString(user._id));
        resp.json(success({
            todos: (todos || [])
                .filter(todo => todo)
                .map(todo => ({
                    id: mongoToString(todo._id),
                    done: todo.done,
                    description: todo.description
                }))
        }));
    }));



    /*
     *
     */
    app.post('/api/user/:userId/todos', authenticated(async ({req, resp, user}) => {
        
        // check req param `userId` is current user
        if (req.params.userId !== mongoToString(user._id)) {
            resp.json(fail.accessViolation());
            return;
        }

        console.log(req.body);

        const todoId = await db.insertTodo({
            owner: mongoToString(user._id),
            description: req.body && req.body.description,
            done: req.body && req.body.done
        });

        resp.json(success({
            todoId: mongoToString(todoId)
        }));
    }));



    /*
     *
     */
    app.put('/api/user/:userId/todos/:todoId', authenticated(async ({req, resp, user}) => {

        // check req param `userId` is current user
        if (req.params.userId !== mongoToString(user._id)) {
            resp.json(fail.accessViolation());
            return;
        }

        // check todo exists
        const todo = await db.findTodoById(req.params.todoId);
        if (!todo) {
            resp.json(fail.accessViolation());
            return;
        }

        // check authenticated user is owner
        if (todo.owner !== mongoToString(user._id)) {
            resp.json(fail.accessViolation());
            return;
        }


        const updated = await db.updateTodoById(todo._id, todo.version, {
            description: req.body && req.body.description,
            done: req.body && req.body.done
        });

        if (!updated) {
            resp.json(fail.db());
            return;
        }

        resp.json(success());

    }));




    /*
     *
     */
    app.delete('/api/user/:userId/todos/:todoId', authenticated(async ({req, resp, user}) => {

        // check req param `userId` is current user
        if (req.params.userId !== mongoToString(user._id)) {
            resp.json(fail.accessViolation());
            return;
        }

        // check todo exists
        const todo = await db.findTodoById(req.params.todoId);
        if (!todo) {
            resp.json(fail.accessViolation());
            return;
        }

        // check authenticated user is owner
        if (todo.owner !== mongoToString(user._id)) {
            resp.json(fail.accessViolation());
            return;
        }


        const deleted = await db.deleteTodoById(todo._id, todo.version);

        if (!deleted) {
            resp.json(fail.db());
            return;
        }

        resp.json(success());

    }));

    app.post('/api/user', authenticated(async ({req, resp, user}) => {

        // only admin user is admin :), this is a hack
        if (user.username !== 'admin') {
            resp.json(fail.accessViolation());
            return;
        }

        if (!req.body || !req.body.username || !req.body.password) {
            resp.json(fail.badRequest());
            return;
        }

        const password = req.body && req.body.password;
        const username = req.body && req.body.username;

        const hashBuf = await security.createHashBuf(password);

        await db.insertUser({
            username,
            hashBuf
        });

        resp.json(success());
    }));






    // documents / client

    if (process.env.TODOLIST_DOCUMENT_PROXY) {
        const documentProxy = process.env.TODOLIST_DOCUMENT_PROXY;
        logger `INFO` `using document proxy ${{documentProxy}}`;
        app.use(proxy({
            target: documentProxy,
            ws: true,
            changeOrigin: true
        }));
    } else if (process.env.TODOLIST_DOCUMENT_DIR) {
        const documentDir = process.env.TODOLIST_DOCUMENT_DIR;
        logger `INFO` `using document dir ${{documentDir}}`;
        app.use(express.static(documentDir));
    } else {
        logger `WARN` `no document source defined`;
    }




    // server listen
    const server = new https.Server(sslOptions, app);

    await new Promise((resolve, reject) => {

        server.listen(
            process.env.TODOLIST_BIND_PORT || 8080,
            process.env.TODOLIST_BIND_HOST || 'localhost',
            resolve
        );
    });

    const serverAddress = server.address();
    const host = `${serverAddress.address}:${serverAddress.port}`;

    logger `INFO` `listening on ${{host}}`;


})();
