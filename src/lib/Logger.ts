import * as bunyan from 'bunyan';
import rfs from 'rotating-file-stream';
import { Config } from './Config';

export class Logger {
  private _logger: bunyan;

  private constructor(logger: bunyan) {
    this._logger = logger;
  }

  public static create(config: Config) {
    let serverLogStream = rfs('server.log', {
      interval: '1d',
      maxFiles: 5,
      path: config.logDir
    });
    let streams: any = [{ stream: serverLogStream }];
    if (config.logToConsole) {
      streams.push({ stream: process.stdout });
    }
    return Logger.createForStreams(config.logLevel, streams);
  }

  public static createForStreams(level: any, streams: any[]) {
    return new Logger(bunyan.createLogger({
      level,
      streams,
      name: 'main',
      // required to include errors, see https://github.com/trentm/node-bunyan/issues/369
      serializers: bunyan.stdSerializers
    }));
  }

  public debug(message: string, obj?: object) {
    obj ? this._logger.debug(obj, message) : this._logger.debug(message);
  }

  public info(message: string, obj?: object) {
    obj ? this._logger.info(obj, message) : this._logger.info(message);
  }

  public warn(message: string, obj?: object) {
    obj ? this._logger.warn(obj, message) : this._logger.warn(message);
  }

  public error(message: string, obj?: object) {
    obj ? this._logger.error(obj, message) : this._logger.error(message);
  }

  public child(module: string) {
    return new Logger(this._logger.child({module}));
  }
}
