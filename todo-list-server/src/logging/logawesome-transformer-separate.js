const joinTemplateUnknownTypeMessage = what => `unknown type, expect string or template array: ${typeof what} = ${JSON.stringify(what)}`;
const joinTemplateUnknownPlaceholder = what => `unknown placeholder type: ${typeof what} = ${JSON.stringify(stringOrTpl)}`;

const joinSeparatContextTpl = stringOrTpl => {
    if (typeof stringOrTpl === 'string') {
        return [stringOrTpl, {}];
    }

    if (
        !Array.isArray(stringOrTpl)
        || stringOrTpl.length !== 2
        || !Array.isArray(stringOrTpl[0])
        || !Array.isArray(stringOrTpl[1])
        || stringOrTpl[0].length !== stringOrTpl[1].length + 1
    ) {
        throw new TypeError(joinTemplateUnknownTypeMessage(stringOrTpl));
    }

    const context = {};
    let nextPlaceholderId = 1;

    let string = stringOrTpl[0][0];
    for (let i = 0; i < stringOrTpl[1].length; ++i) {
        const text = stringOrTpl[0][i + 1];
        let placeholder = stringOrTpl[1][i];

        while (placeholder instanceof Function) {
            placeholder = placeholder();
        }

        if (typeof placeholder === 'string' || typeof placeholder === 'number' || Array.isArray(placeholder)) {
            const id = nextPlaceholderId++;
            const placeholderName = `_${id}`;
            context[placeholderName] = placeholder;
            string += `\${${placeholderName}}`;
        } else if (typeof placeholder === 'object') {
            
            Object.keys(placeholder).forEach((key, j) => {
                const value = placeholder[key];
                let placeholderName = key;
                let id = 2;
                while (placeholderName in context) {
                    placeholderName = `${key}${id++}`;
                }

                context[placeholderName] = value;
                
                if (j !== 0) {
                    string += ', ';
                }

                string += `\${${placeholderName}}`;
            });
        } else {
            throw new TypeError(joinTemplateUnknownPlaceholder(placeholder));
        }

        string += text;

    }

    return [string, context];
};

export default writeFn => (
    logTimestamp,
    context,
    levelStringOrTpl,
    messageStringOrTpl
) => {
    
    const [logLevel, logLevelContext] = joinSeparatContextTpl(levelStringOrTpl);
    const [logMessage, logMessageContext] = joinSeparatContextTpl(messageStringOrTpl);

    writeFn({
        logTimestamp,
        logLevel,
        logMessage,
        context: {
            ...context,
            ...logLevelContext,
            ...logMessageContext
        }
    });
};
