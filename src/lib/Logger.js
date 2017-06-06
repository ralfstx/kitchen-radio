import {join} from 'path';
import winston from 'winston';

/* Winston uses npm log levels by default
 * 0: error
 * 1: warn
 * 2: info
 * 3: verbose
 * 4: debug
 * 5: silly
 */

export default class Logger extends winston.Logger {

  constructor(context) {
    let level = context.logLevel || 'info';
    let filename = join(context.logDir || '.', 'server.log');
    super({
      level,
      transports: [
        new winston.transports.Console({
          level,
          handleExceptions: true,
          prettyPrint: true,
          colorize: true,
          silent: false,
          timestamp: false
        }),
        new winston.transports.File({
          filename,
          level,
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
    this.info('Logging with level', level);
  }

}
