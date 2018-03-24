import mongodb from 'mongodb';
import { logSystem } from './log-system';

const logger = logSystem.createLogger();
logger.set('coId', 'MongoDB');

export const mongoToString = any => {
    if (any instanceof mongodb.ObjectId) {
        return any.toHexString();
    }

    return '' + any;
};

export const mongoToObjectId = any => {
    if (any instanceof mongodb.ObjectId) {
        return any;
    }

    any = mongoToString(any);
    return mongodb.ObjectId.createFromHexString(any);
};

export const mongoToNumber = any => +any || 0;

export const mongoToBoolean = any => !!any;

export default class MongoDB {

    constructor() {
        this._mongoClient = null;
        this._mongoDb = null;
    }

    get connected() {
        return this._mongoClient && this._mongoClient.isConnected()
    }

    async connect(url, db) {
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





    async _findOne(collection, by) {
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

    async _find(collection, by) {
        return await this._mongoDb
            .collection(collection)
            .find(by)
            .toArray()
        ;
    }




    async _deleteOne(collection, by) {
        const opResult = await this._mongoDb
            .collection(collection)
            .deleteOne(by)
        ;

        return opResult && opResult.deletedCount > 0;
    }





    async _findOneSession(by) {
        return await this._findOne('sessions', by);
    }

    async _findOneUser(by) {
        return await this._findOne('users', by);
    }

    async _findOneTodo(by) {
        return await this._findOne('todos', by);
    }

    async _findTodos(by) {
        return await this._find('todos', by);
    }

    async _deleteOneTodo(by) {
        return await this._deleteOne('todos', by);
    }







    async findSessionByAuthToken(authToken) {
        authToken = mongoToString(authToken);

        return await this._findOneSession({authToken});
    }

    async insertSession(userId, authToken) {
        userId = mongoToObjectId(userId);
        authToken = mongoToString(authToken);
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







    async findUserById(userId) {
        userId = mongoToObjectId(userId);

        return await this._findOneUser({_id: userId});
    }

    async findUserByUsername(username) {
        username = mongoToString(username);

        return await this._findOneUser({username});
    }

    async insertUser({username, hashBuf}) {
        username = mongoToString(username);
        const hash = hashBuf.toString('base64');

        await this._mongoDb
            .collection('users')
            .insertOne({
                username,
                hash
            })
        ;
    }





    async findTodosByUserId(userId) {
        userId = mongoToString(userId);

        return await this._findTodos({
            owner: userId
        });
    }

    async findTodoById(todoId) {
        todoId = mongoToObjectId(todoId);

        return await this._findOneTodo({
            _id: todoId
        });
    }

    async deleteTodoById(todoId, version) {
        todoId = mongoToObjectId(todoId);
        version = mongoToNumber(version);

        return await this._deleteOneTodo({
            _id: todoId,
            version
        });
    }

    async insertTodo({
        owner,
        description,
        done
    }) {

        owner = mongoToString(owner);
        description = mongoToString(description);
        done = mongoToBoolean(done);
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

    async updateTodoById(todoId, version, {
        description,
        done
    }) {
        todoId = mongoToObjectId(todoId);
        description = mongoToString(description);
        done = mongoToBoolean(done);
        version = mongoToNumber(version);

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