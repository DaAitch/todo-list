import cluster from 'cluster';

import express from 'express';

import logawesomeMiddleware from './logging/logawesome-express-middleware';
import MongoDB from './MongoDB';
import {createServer} from './server';

import routesApiSystemStatus from './routes/api/system/status';
import routesApiUserLogin from './routes/api/user/login';
import routesApiUserAuth from './routes/api/user/auth';
import routesApiUserTodos from './routes/api/user/todos';
import routesApiUser from './routes/api/user';

import {createDocumentProxy, createDocumentStaticProvider} from './routes/client';

import {exitCodes} from './exit';


export const runApp = async logger => {

    // logging
    logger `INFO` `starting todo list`;


    // database
    const db = new MongoDB();


    // database connect
    {
        const mongoUrl = process.env.TODOLIST_MONGO_URL || 'mongodb://localhost:27017';
        const mongoDb = process.env.TODOLIST_MONGO_DB || 'todolist';
        logger `INFO` `connect to MongoDB url ${{mongoUrl}}, db ${{mongoDb}}`;
        
        try {
            await db.connect(mongoUrl, mongoDb);
            logger `INFO` `connected to MongoDB`;
        } catch (error) {
            logger `ERROR` `connect to MongoDB: ${{error}}`;
            return process.exit(exitCodes.MONGO_DB_ERROR);
        }
    }


    // app
    const app = express();


    // middlewares
    {
        app.use(logawesomeMiddleware());
        app.use(express.json());
    }


    // routes
    {
        const routeParams = {app, db};
        routesApiSystemStatus(routeParams);
        routesApiUserLogin(routeParams);
        routesApiUserAuth(routeParams);
        routesApiUserTodos(routeParams);
        routesApiUser(routeParams);
    }


    // documents / client
    {
        if (process.env.TODOLIST_DOCUMENT_PROXY) {
            
            const proxyUrl = process.env.TODOLIST_DOCUMENT_PROXY;
            logger `INFO` `using document proxy ${{proxyUrl}}`;
            createDocumentProxy({app, proxyUrl});

        } else if (process.env.TODOLIST_DOCUMENT_DIR) {
            
            const documentDir = process.env.TODOLIST_DOCUMENT_DIR;
            logger `INFO` `using document dir ${{documentDir}}`;
            createDocumentStaticProvider({app, documentDir});

        } else {
            logger `WARN` `no document source defined`;
        }
    }


    // create server
    {
        const server = await createServer({
            keyFile: process.env.TODOLIST_SSL_KEY,
            certFile: process.env.TODOLIST_SSL_CERT,
            port: process.env.TODOLIST_BIND_PORT || 8080,
            host: process.env.TODOLIST_BIND_HOST || 'localhost',
            requestHandler: app,
            passphrase: process.env.TODOLIST_SSL_PASSPHRASE
        });

        const serverAddress = server.address();
        const host = `${serverAddress.address}:${serverAddress.port}`;

        logger `INFO` `listening on ${{host}}`;
    }


    logger `INFO` `app is running`;

};
