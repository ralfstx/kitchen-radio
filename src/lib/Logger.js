import {join} from 'path';
import * as winston from 'winston';
import {Config} from './Config'; // eslint-disable-line no-unused-vars

/* Winston uses npm log levels by default
 * 0: error
 * 1: warn
 * 2: info
 * 3: verbose
 * 4: debug
 * 5: silly
 */

export class Logger extends winston.Logger {

  /**
   * @param {Config} config
   */
  constructor(config) {
    let level = config.logLevel;
    let filename = join(config.logDir, 'server.log');
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
  }

}
