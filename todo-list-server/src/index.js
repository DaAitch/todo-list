import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';
import {exitCodes} from './exit';
import {runApp} from './app';
import {createLogger} from './log';

// read env
dotenv.config();

const logger = createLogger('main');

// process events
process.on('unhandledRejection', error => {
    logger `ERROR` `unhandled rejection: ${{error}}`;
    return process.exit(exitCodes.UNHANDLED_REJECTION);
});

process.on('unhandledException', error => {
    logger `ERROR` `unhandled exception: ${{error}}`;
    return process.exit(exitCodes.UNHANDLED_EXCEPTION);
});


if (cluster.isMaster) {
  
    const cpuCount = os.cpus().length;
    const workerCounter = cpuCount;

    for (let i = 0; i < workerCounter; i++) {
        const worker = cluster.fork();
        const workerId = worker.id;
        logger `INFO` `started worker with ${{workerId}}`;
    }

    cluster.on('exit', (worker, code, signal) => {
        const workerId = worker.id;
        logger `INFO` `worker with id ${{workerId}} exited with signal ${{signal}} and code ${{code}}`;
    });

} else {

    // run app
    runApp(logger).catch(error => {
        // eslint-disable-next-line no-console
        logger `ERROR` `unknown error: ${{error}}`;
        return process.exit(exitCodes.UNKNOWN_ERROR);
    });

}
