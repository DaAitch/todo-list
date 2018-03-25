import uuid from 'uuid';
import * as security from '../../../security';
import {success, fail} from '../../../rest';

export default ({app, db}) => {
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
            Buffer.from('' + user.hash, 'base64') // hacky
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
};
