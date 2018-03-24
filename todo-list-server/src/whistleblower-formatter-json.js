import moment from 'moment';

export default logEntry => {
    return JSON.stringify({
        ...logEntry,
        logTimestamp: moment(logEntry.logTimestamp).toISOString()
    });
};