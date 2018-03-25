import dotenv from 'dotenv';
import {exitCodes} from './exit';
import {runApp} from './app';


// read env
dotenv.config();


// process events
process.on('unhandledRejection', e => {
    // eslint-disable-next-line no-console
    console.error('unhandled rejection', e);
    return process.exit(exitCodes.UNHANDLED_REJECTION);
});

process.on('unhandledException', e => {
    // eslint-disable-next-line no-console
    console.error('unhandled exception', e);
    return process.exit(exitCodes.UNHANDLED_EXCEPTION);
});


// run app
runApp().catch(e => {
    // eslint-disable-next-line no-console
    console.error('unknown error', e);
    return process.exit(exitCodes.UNKNOWN_ERROR);
});
