import winston from 'winston';
import path from 'path';

const loglevel = process.env.LOGLEVEL || 'info';
const logpath = process.env.LOGPATH || '/var/log';

const logger = winston.createLogger({
    level: loglevel,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.errors()),
    transports: [
        new winston.transports.File({ filename: path.join(logpath, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logpath, 'info.log'), level: 'info' }),
        new winston.transports.File({ filename: path.join(logpath, 'debug.log') }),
        new winston.transports.Console({ level: 'error' })
    ],
  });

  export default logger;