import {createAuthenticator} from '../../../security';
import {success} from '../../../rest';
import {asString} from '../../../cast';

export default ({app, db}) => {

    const authenticated = createAuthenticator(db);

    app.post('/api/user/auth', authenticated, async (req, res) => {
        res.json(success({
            userId: asString(req.authenticated.user._id)
        }));
    });

    app.delete('/api/user/auth', authenticated, async (req, resp) => {
        await db.deleteSession(req.authenticated.session.authToken);
        resp.json(success());
    });
};
