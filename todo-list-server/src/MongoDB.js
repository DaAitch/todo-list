import mongodb from 'mongodb';
import {asString, asNumber, asBoolean, asObjectId} from './cast';

export default class MongoDB {

    constructor () {
        this._mongoClient = null;
        this._mongoDb = null;
    }

    get connected () {
        return this._mongoClient && this._mongoClient.isConnected();
    }

    async connect (url, db) {
        return await new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, (err, mongoClient) => {
                if (err) {
                    reject(err);
                    return;
                }

                this._mongoClient = mongoClient;
                this._mongoDb = mongoClient.db(db);

                resolve();
            });
        });
    }

    async _findOne (collection, by) {
        const documents = await this._mongoDb
            .collection(collection)
            .find(by)
            .limit(1)
            .toArray()
        ;

        if (documents.length !== 1) {
            return null;
        }

        return documents[0];
    }

    async _find (collection, by) {
        return await this._mongoDb
            .collection(collection)
            .find(by)
            .toArray()
        ;
    }


    async _deleteOne (collection, by) {
        const opResult = await this._mongoDb
            .collection(collection)
            .deleteOne(by)
        ;

        return opResult && opResult.deletedCount > 0;
    }


    async _findOneSession (by) {
        return await this._findOne('sessions', by);
    }

    async _findOneUser (by) {
        return await this._findOne('users', by);
    }

    async _findOneTodo (by) {
        return await this._findOne('todos', by);
    }

    async _findTodos (by) {
        return await this._find('todos', by);
    }

    async _deleteOneTodo (by) {
        return await this._deleteOne('todos', by);
    }


    async findSessionByAuthToken (authToken) {
        authToken = asString(authToken);

        return await this._findOneSession({authToken});
    }

    async insertSession (userId, authToken) {
        userId = asObjectId(userId);
        authToken = asString(authToken);
        const version = 1;

        await this._mongoDb
            .collection('sessions')
            .insertOne({
                userId,
                authToken,
                version
            })
        ;
    }

    async deleteSession (authToken) {
        authToken = asString(authToken);

        await this._deleteOne('sessions', {
            authToken
        });
    }


    async findUserById (userId) {
        userId = asObjectId(userId);

        return await this._findOneUser({_id: userId});
    }

    async findUserByUsername (username) {
        username = asString(username);

        return await this._findOneUser({username});
    }

    async insertUser ({username, hashBuf}) {
        username = asString(username);
        const hash = hashBuf.toString('base64');

        await this._mongoDb
            .collection('users')
            .insertOne({
                username,
                hash
            })
        ;
    }


    async findTodosByUserId (userId) {
        userId = asString(userId);

        return await this._findTodos({
            owner: userId
        });
    }

    async findTodoById (todoId) {
        todoId = asObjectId(todoId);

        return await this._findOneTodo({
            _id: todoId
        });
    }

    async deleteTodoById (todoId, version) {
        todoId = asObjectId(todoId);
        version = asNumber(version);

        return await this._deleteOneTodo({
            _id: todoId,
            version
        });
    }

    async insertTodo ({
        owner,
        description,
        done
    }) {

        owner = asString(owner);
        description = asString(description);
        done = asBoolean(done);
        const version = 1;

        const opResult = await this._mongoDb
            .collection('todos')
            .insertOne({
                owner,
                description,
                done,
                version
            })
        ;

        return opResult && opResult.insertedId;
    }

    async updateTodoById (todoId, version, {
        description,
        done
    }) {
        todoId = asObjectId(todoId);
        description = asString(description);
        done = asBoolean(done);
        version = asNumber(version);

        const opResult = await this._mongoDb
            .collection('todos')
            .updateOne({
                _id: todoId,
                version
            }, {
                $set: {
                    version: version + 1,
                    description,
                    done
                }
            })
        ;

        return opResult && opResult.modifiedCount > 0;
    }


}
