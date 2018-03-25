import {createAuthenticator} from '../../../security';
import {success} from '../../../rest';
import {asString} from '../../../cast';

export default ({app, db}) => {

    const authenticated = createAuthenticator(db);

    app.post('/api/user/auth', authenticated(async ({resp, user}) => {
        resp.json(success({
            userId: asString(user._id)
        }));
    }));

    app.delete('/api/user/auth', authenticated(async ({resp, session}) => {
        await db.deleteSession(session.authToken);
        resp.json(success());
    }));
};
