import uuid from 'uuid';
import {createLogger} from '../log';

export default () => (req, resp, next) => {

    req.logger = createLogger(`reqID:${uuid.v4()}`);

    const method = req.method;
    const path = req.path;
    req.logger `INFO` `Request: ${{method}} ${{path}}`;

    resp.once('finish', () => {
        
        const statusCode = resp.statusCode;
        const statusMessage = resp.statusMessage;

        req.logger `INFO` `Response: ${{method}} ${{path}} => ${{statusCode}} "${{statusMessage}}"`;
    });

    next();
};
