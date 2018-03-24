
const response = (error, result) => ({ error, result });

export const success = result => {
    return response(null, result);
};

const _fail = (code, message) => {
    message = message || null;
    return response({code, message}, null);
}

export const fail = {
    auth: message => _fail('AUTHENTICATION_FAILED', message),
    login: message => _fail('LOGIN_FAILED', message),
    accessViolation: message => _fail('ACCESS_VIOLATION', message),
    db: message => _fail('DB_OPERATION_FAILED', message),
};