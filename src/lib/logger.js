import {join} from 'path';
import winston from 'winston';

import config from './config';

export default new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: config.get('logLevel'),
      handleExceptions: true,
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: false
    }),
    new winston.transports.File({
      filename: join(config.get('logDir'), 'debug.log'),
      maxsize: 40000,
      maxFiles: 10,
      level: config.get('logLevel'),
      handleExceptions: true,
      prettyPrint: false,
      colorize: false,
      silent: false,
      timestamp: true,
      json: false
    })
  ],
  exitOnError: false
});
