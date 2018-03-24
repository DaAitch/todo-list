
import { mongoToString } from './MongoDB';
import { fail } from './rest';

export default db => handler => async (req, resp) => {
    const session = await db.findSessionByAuthToken(req.headers.authorization);
        
    if (!session) {
        resp.json(fail.auth());
        return;
    }

    const user = await db.findUserById(session.userId);
    if (!user) {
        const sessionId = mongoToString(session._id);
        const userId = mongoToString(session.userId);
        req.logger `ERROR` `illegal db state, has session ${{sessionId}} with user id ${{userId}}, but no corresponding user with id ${{userId}}`;
        resp.json(fail.auth());
        return;
    }

    const userId = mongoToString(user._id);
    req.logger.set({userId});
    req.logger `INFO` `authorized user`;

    const handlerParams = {
        req,
        resp,
        user
    };
    
    return handler(handlerParams);
};