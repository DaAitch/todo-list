import crypto from 'crypto';
import util from 'util';
import {asString} from './cast';

const randomBytes = util.promisify(crypto.randomBytes);
const pbkdf2 = util.promisify(crypto.pbkdf2);

const SALT_BYTES = 4096;
const ITERATIONS = 10000;
const KEYLEN = 4096;
const DIGEST = Buffer.from('sha512');

export const generateHashInfo = async () => {
    const [salt] = await Promise.all([
        randomBytes(SALT_BYTES)
    ]);

    const iterations = ITERATIONS;
    const keylen = KEYLEN;
    const digest = DIGEST;

    return {
        salt,
        iterations,
        keylen,
        digest
    };
};

export const hashAlg = async (secret, {salt, iterations, keylen, digest}) => {
    const hash = await pbkdf2(secret, salt, iterations, keylen, digest.toString());
    return hash;
};

export const pack = ({salt, iterations, keylen, digest, hash}) => {
    const buf = new Buffer(
        4 // salt length
        + salt.length
        + 4 // iterations
        + 4 // keylen
        + 4 // digest length
        + digest.length
        + 4 // hash length
        + hash.length
    );

    // eslint-disable-next-line no-unused-vars
    let i = 0;

    i = buf.writeUInt32BE(salt.length, i, true);
    i += salt.copy(buf, i);
    i = buf.writeUInt32BE(iterations, i, true);
    i = buf.writeUInt32BE(keylen, i, true);
    i = buf.writeUInt32BE(digest.length, i, true);
    i += digest.copy(buf, i);
    i = buf.writeUInt32BE(hash.length, i, true);
    i += hash.copy(buf, i);

    return buf;
};

export const unpack = buf => {
    let i = 0;
    
    const saltLength = buf.readUInt32BE(i);
    i += 4;
    
    const salt = new Buffer(saltLength);
    buf.copy(salt, 0, i, i + saltLength);
    i += saltLength;

    const iterations = buf.readUInt32BE(i);
    i += 4;

    const keylen = buf.readUInt32BE(i);
    i += 4;

    const digestLength = buf.readUInt32BE(i);
    i += 4;

    const digest = new Buffer(digestLength);
    buf.copy(digest, 0, i, i + digestLength);
    i += digestLength;

    const hashLength = buf.readUInt32BE(i);
    i += 4;

    const hash = new Buffer(hashLength);
    buf.copy(hash, 0, i, i + hashLength);
    i += hashLength;

    return {
        salt,
        iterations,
        keylen,
        digest,
        hash
    };
};

export const compareHash = async (secret, hashBuf) => {
    let hashInfo;
    try {
        hashInfo = unpack(hashBuf);
    } catch (e) {
        return false;
    }

    const hash = await hashAlg(secret, hashInfo);

    return hashInfo.hash.equals(hash);
};

export const createHashBuf = async secret => {
    const hashInfo = await generateHashInfo();
    const hash = await hashAlg(secret, hashInfo);

    return pack({
        ...hashInfo,
        hash
    });
};


export const createAuthenticator = db => handler => async (req, resp) => {
    const session = await db.findSessionByAuthToken(req.headers.authorization);
        
    if (!session) {
        resp.json(fail.auth());
        return;
    }

    const user = await db.findUserById(session.userId);
    if (!user) {
        const sessionId = asString(session._id);
        const userId = asString(session.userId);
        req.logger `ERROR` `illegal db state, has session ${{sessionId}} with user id ${{userId}}, but no corresponding user with id ${{userId}}`;
        resp.json(fail.auth());
        return;
    }

    const userId = asString(user._id);
    req.logger.set({userId});
    req.logger `INFO` `authorized user`;

    const handlerParams = {
        req,
        resp,
        user,
        session
    };
    
    return handler(handlerParams);
};
