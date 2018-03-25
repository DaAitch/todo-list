import {createAuthenticator} from '../../../security';
import {success, fail} from '../../../rest';
import {asString} from '../../../cast';
import * as rights from '../../../rights';

export default ({app, db}) => {

    const authenticated = createAuthenticator(db);

    app.get('/api/user/:userId/todos', authenticated(async ({req, resp, user}) => {

        if (req.params.userId !== asString(user._id)) {
            resp.json(fail.accessViolation());
            return;
        }
        
        const todos = await db.findTodosByUserId(asString(user._id));
        resp.json(success({
            todos: (todos || [])
                .filter(todo => todo)
                .map(todo => ({
                    id: asString(todo._id),
                    done: todo.done,
                    description: todo.description
                }))
        }));
    }));

    app.post('/api/user/:userId/todos', authenticated(async ({req, resp, user}) => {
        
        // check req param `userId` is current user
        if (req.params.userId !== asString(user._id)) {
            resp.json(fail.accessViolation());
            return;
        }

        const todoId = await db.insertTodo({
            owner: asString(user._id),
            description: req.body && req.body.description,
            done: req.body && req.body.done
        });

        resp.json(success({
            todoId: asString(todoId)
        }));
    }));

    app.put('/api/user/:userId/todos/:todoId', authenticated(async ({req, resp, user}) => {

        // check req param `userId` is current user
        if (req.params.userId !== asString(user._id)) {
            resp.json(fail.accessViolation());
            return;
        }

        if (!rights.allowed.updateTodo(user)) {
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
        if (todo.owner !== asString(user._id)) {
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

    app.delete('/api/user/:userId/todos/:todoId', authenticated(async ({req, resp, user}) => {

        // check req param `userId` is current user
        if (req.params.userId !== asString(user._id)) {
            resp.json(fail.accessViolation());
            return;
        }

        if (!rights.allowed.deleteTodo(user)) {
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
        if (todo.owner !== asString(user._id)) {
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
};
