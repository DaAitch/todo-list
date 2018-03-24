import uuid from 'uuid';

export default logSystem => (req, resp, next) => {
    req.logger = logSystem.createLogger();

    const coId = `reqID:${uuid.v4()}`;
    req.logger.set({coId});

    const method = req.method;
    const path = req.path;
    req.logger `DEBUG` `Request: ${{method}} ${{path}}`;

    resp.once('finish', () => {
        
        const statusCode = resp.statusCode;
        const statusMessage = resp.statusMessage;

        req.logger `DEBUG` `Response: ${{method}} ${{path}} ${{statusCode}} ${{statusMessage}}`;
    });

    next();
};