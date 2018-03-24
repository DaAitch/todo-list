
const JOINTPL_UNKNOWN_TYPE_MESSAGE = what => `unknown type, expect string or template array: ${typeof what} = ${JSON.stringify(what)}`;

const placeholderToString = placeholder => {
    if (Array.isArray(placeholder)) {
        if (placeholder.length === 0) {
            return '[]';
        }

        return placeholder.join(', ');
    }

    if (typeof placeholder === 'object') {
        const keys = Object.keys(placeholder);
        if (keys.length === 0) {
            return '-';
        }

        if (keys.length === 1) {
            return placeholderToString(placeholder[keys[0]]);
        }

        return keys
            .map(key => `${key}=${placeholder[key]}`)
            .join(', ')
        ;
    }

    return '' + placeholder;
};

const joinTpl = stringOrTpl => {
    if (typeof stringOrTpl === 'string') {
        return stringOrTpl;
    }

    if (
        !Array.isArray(stringOrTpl)
        || stringOrTpl.length !== 2
        || !Array.isArray(stringOrTpl[0])
        || !Array.isArray(stringOrTpl[1])
        || stringOrTpl[0].length !== stringOrTpl[1].length + 1
    ) {
        throw new TypeError(JOINTPL_UNKNOWN_TYPE_MESSAGE(stringOrTpl));
    }

    let result = stringOrTpl[0][0];

    for (let i = 0; i < stringOrTpl[1].length; ++i) {
        result += placeholderToString(stringOrTpl[1][i]) + stringOrTpl[0][i+1];
    }

    return result;
}

export default writeFn => (
    logTimestamp,
    context,
    levelStringOrTpl,
    messageStringOrTpl
) => {

    const logLevel = joinTpl(levelStringOrTpl);
    const logMessage = joinTpl(messageStringOrTpl);

    writeFn({
        logTimestamp,
        logLevel,
        logMessage,
        context
    });
}