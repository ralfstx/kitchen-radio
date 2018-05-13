import { join } from 'path';
import * as winston from 'winston';
import { Config } from './Config';

/* Winston uses npm log levels by default
 * 0: error
 * 1: warn
 * 2: info
 * 3: verbose
 * 4: debug
 * 5: silly
 */

export class Logger extends winston.Logger {

  constructor(config: Config) {
    let level = config.logLevel;
    let levels = winston.config.npm.levels;
    let filename = join(config.logDir, 'server.log');
    super({
      level,
      levels,
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

  // overriding the builtin field, because it's missing in @types/winston
  get levels() {
    return winston.config.npm.levels;
  }
}
