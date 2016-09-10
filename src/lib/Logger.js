import {join} from 'path';
import winston from 'winston';

export default class Logger extends winston.Logger {

  constructor(context) {
    super({
      transports: [
        new winston.transports.Console({
          level: context.get('logLevel'),
          handleExceptions: true,
          prettyPrint: true,
          colorize: true,
          silent: false,
          timestamp: false
        }),
        new winston.transports.File({
          filename: join(context.get('logDir'), 'debug.log'),
          maxsize: 40000,
          maxFiles: 10,
          level: context.get('logLevel'),
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
  }

}
