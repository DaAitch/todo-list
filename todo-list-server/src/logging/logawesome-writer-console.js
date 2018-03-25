const levels = {
    DEBUG: console.log.bind(console), // eslint-disable-line
    INFO: console.info.bind(console), // eslint-disable-line
    WARN: console.warn.bind(console), // eslint-disable-line
    ERROR: console.error.bind(console), // eslint-disable-line
};

export default ({
    mapper = logLevel => logLevel,
    formatter = logEntry => logEntry
}) => {
    if (typeof mapper !== 'function') {
        const mapping = mapper;
        mapper = logLevel => mapping[logLevel];
    }

    return logEntry => {
        const logLevel = logEntry.logLevel;
        const consoleLogLevel = mapper(logLevel);
        const consoleLogger = levels[consoleLogLevel];
        if (!consoleLogger) {
            // eslint-disable-next-line new-cap
            levels.WARN(`unknown console log level ${consoleLogLevel} mapped from ${logLevel}`);
            return;
        }

        consoleLogger(formatter(logEntry));
    };
};
