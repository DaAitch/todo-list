import mongodb from 'mongodb';

export const asString = any => {
    if (typeof any === 'string') {
        return any;
    }

    if (Buffer.isBuffer(any)) {
        return any.toString();
    }

    if (any instanceof mongodb.ObjectId) {
        return any.toHexString();
    }

    return '' + any;
};

export const asBuffer = any => {
    if (Buffer.isBuffer(any)) {
        return any;
    }

    return Buffer.from(asString(any));
};

export const asNumber = any => {
    if (typeof any === 'number') {
        return any;
    }

    return +any || 0;
};

export const asBoolean = any => !!any;

export const asObjectId = any => {
    if (any instanceof mongodb.ObjectId) {
        return any;
    }

    return mongodb.ObjectId.createFromHexString(asString(any));
};
