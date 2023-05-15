import moment = require('moment');
import { writeFileSync } from 'fs';
import { createLogger, format, transports, Logger, LeveledLogMethod, addColors  } from 'winston';

const { combine, label, timestamp, printf, colorize } = format;



export interface CustomLogger extends Logger {
  route: LeveledLogMethod;
  server: LeveledLogMethod;
}

const customLevels = {
  levels: {
    error: 0,
    server:1,
    route: 2,
    warn: 3,
    info: 4,
    debug: 5,
  },
  colors: {
    error: 'red',
    server:'cyan',
    route: 'blue',
    warn: 'yellow',
    info: 'green',
    debug: 'magenta',
  },
};
// Make sure this exists
const LOG_FILE_PATH = 'logs/error.log';
const LOG_DEBUG_PATH = 'logs/debug.log';


writeFileSync(LOG_DEBUG_PATH, '');


const file = new transports.File({ filename: LOG_FILE_PATH, level: 'error' });
const debugFile = new transports.File({ filename: LOG_DEBUG_PATH, level: 'debug' });
const console = new transports.Console();

const logFormat = printf(({ level, message, label: logLabel, timestamp: logTimestamp }) => {
  const vietnamTime = moment(logTimestamp).utcOffset(420).format('HH:mm:ss DD-MM-YYYY');
  return `${vietnamTime} [${logLabel}] ${level}: ${message}`;
});

// register colors with winston
addColors(customLevels.colors);

const logger = createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'info',
  format: combine( colorize(), label({ label: process.env.NODE_ENV }), timestamp(), logFormat),
  transports: [file, debugFile],
}) as CustomLogger;

if (process.env.NODE_ENV !== 'production') {
  logger.remove(file);
  logger.add(console);
}

export default logger;