import { LogSystem } from 'logawesome';
import jsonFormatter from './logawesome-formatter-json';
import toStringFormatter from './logawesome-formatter-tostring';
import coalesceTransformer from './logawesome-transformer-coalesce';
import seperateTransformer from './logawesome-transformer-separate';
import consoleWriter from './logawesome-writer-console';
import fsWriter, { 
    dateStreamSupplier as fsWriterDateStreamSupplier, 
    perRangeRotation as fsWriterPerRangeRotation, 
    timestampFormatFilename as fsWriterTimestampFormatFilename
} from './logawesome-writer-fs';
import path from 'path';

export const logSystem = new LogSystem();
logSystem.addAppender(coalesceTransformer(consoleWriter({formatter: toStringFormatter('HH:mm:ss.SSS')})));
logSystem.addAppender(seperateTransformer(fsWriter({
    streamSupplier: fsWriterDateStreamSupplier({
        path: path.join(__dirname, '../logs'),
        rotation: fsWriterPerRangeRotation(1000 * 60 * 60 * 24),
        timestampToFilename: fsWriterTimestampFormatFilename('[todo-list_]YYYY-MM-DD[.json.log]')
    }),
    formatter: jsonFormatter
})));