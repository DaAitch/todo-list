import fs from 'fs';
import path_ from 'path';
import moment from 'moment';

export const perRangeRotation = millis => {
    return (lastLogEntry, logEntry) => {
        if (!lastLogEntry || !logEntry) {
            return false;
        }

        return Math.trunc(lastLogEntry.logTimestamp / millis) !== Math.trunc(logEntry.logTimestamp / millis);
    };
};

export const timestampFormatFilename = momentJsFormat => {
    return logTimestamp => {
        const m = moment(logTimestamp);
        return m.format(momentJsFormat);
    };
};

export const dateStreamSupplier = ({
    path,
    timestampToFilename,
    rotation
}) => {

    let stream;

    return (lastLogEntry, logEntry, streamFn) => {
        if (rotation(lastLogEntry, logEntry)) {
            if (stream) {
                stream.close();
                stream = null;
            }
        }

        if (!stream) {
            const filePath = path_.join(path, timestampToFilename(logEntry.logTimestamp));
            stream = fs.createWriteStream(filePath, {
                flags: 'a+'
            });
        }

        streamFn(stream);
    };
};

export default ({
    streamSupplier,
    formatter = logEntry => logEntry,
    lineSeparator = '\n'
}) => {

    let lastLogEntry = null;

    return logEntry => {
        streamSupplier(lastLogEntry, logEntry, stream => {
            stream.write(formatter(logEntry));
            stream.write(lineSeparator);
        });
    };
};
