const levels = {
    DEBUG: console.log.bind(console),
    INFO: console.info.bind(console),
    WARN: console.warn.bind(console),
    ERROR: console.error.bind(console),
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
            levels.WARN(`unknown console log level ${consoleLogLevel} mapped from ${logLevel}`);
            return;
        }

        consoleLogger(formatter(logEntry));
    };
};