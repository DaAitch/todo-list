import {createAuthenticator, createHashBuf} from '../../../security';
import {success, fail} from '../../../rest';
import {allowed} from '../../../rights';

export default ({app, db}) => {
    const authenticated = createAuthenticator(db);

    app.post('/api/user', authenticated, async (req, res) => {

        if (!allowed.addUser(req.authenticated.user)) {
            res.json(fail.accessViolation());
            return;
        }

        if (!req.body || !req.body.username || !req.body.password) {
            res.json(fail.badRequest());
            return;
        }

        const password = req.body && req.body.password;
        const username = req.body && req.body.username;

        const hashBuf = await createHashBuf(password);

        await db.insertUser({
            username,
            hashBuf
        });

        res.json(success());
    });
};
