import {createAuthenticator, createHashBuf} from '../../../security';
import {success, fail} from '../../../rest';
import {allowed} from '../../../rights';

export default ({app, db}) => {
    const authenticated = createAuthenticator(db);

    app.post('/api/user', authenticated(async ({req, resp, user}) => {

        if (!allowed.addUser(user)) {
            resp.json(fail.accessViolation());
            return;
        }

        if (!req.body || !req.body.username || !req.body.password) {
            resp.json(fail.badRequest());
            return;
        }

        const password = req.body && req.body.password;
        const username = req.body && req.body.username;

        const hashBuf = await createHashBuf(password);

        await db.insertUser({
            username,
            hashBuf
        });

        resp.json(success());
    }));
};
