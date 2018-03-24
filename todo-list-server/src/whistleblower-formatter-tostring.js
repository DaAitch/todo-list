import moment from 'moment';

export default momentJsFormat => logEntry => {
    const contextAppendix = Object.keys(logEntry.context).length === 0 ? '' : ` [${JSON.stringify(logEntry.context)}]`;
    return `${moment(logEntry.logTimestamp).format(momentJsFormat)} ${logEntry.logLevel}: ${logEntry.logMessage}${contextAppendix}`;
};