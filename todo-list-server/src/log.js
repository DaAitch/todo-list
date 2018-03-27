import path from 'path';
import cluster from 'cluster';

import {LogSystem} from 'logawesome';
import jsonFormatter from './logging/logawesome-formatter-json';
import toStringFormatter from './logging/logawesome-formatter-tostring';
import coalesceTransformer from './logging/logawesome-transformer-coalesce';
import seperateTransformer from './logging/logawesome-transformer-separate';
import consoleWriter from './logging/logawesome-writer-console';
import fsWriter, {
    dateStreamSupplier as fsWriterDateStreamSupplier,
    perRangeRotation as fsWriterPerRangeRotation,
    timestampFormatFilename as fsWriterTimestampFormatFilename
} from './logging/logawesome-writer-fs';

let workerName;
if (cluster.isMaster) {
    workerName = 'master';
} else if (cluster.isWorker) {
    workerName = `worker.${cluster.worker.id}`;
}


export const logSystem = new LogSystem();
logSystem.addAppender(seperateTransformer(fsWriter({
    streamSupplier: fsWriterDateStreamSupplier({
        path: path.join(__dirname, '../logs'),
        rotation: fsWriterPerRangeRotation(1000 * 60 * 60 * 24),
        timestampToFilename: fsWriterTimestampFormatFilename(`[todo-list_]YYYY-MM-DD[.${workerName}.json.log]`)
    }),
    formatter: jsonFormatter
})));

if (process.env.NODE_ENV !== 'production') {
    logSystem.addAppender(coalesceTransformer(consoleWriter({formatter: toStringFormatter('HH:mm:ss.SSS')})));
}


// correlation id name
const COID_NAME = 'coId';
const WORKER_NAME = 'worker';

export const createLogger = coId => {
    const logger = logSystem.createLogger();
    logger.set(COID_NAME, coId);
    logger.set(WORKER_NAME, workerName);

    return logger;
};
