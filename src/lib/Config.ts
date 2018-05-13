import { readJson } from 'fs-extra';

const CONFIG_VARS: {[key: string]: ConfigSpec} = {
  port: {type: 'validPort', default: 8080},
  mpdPort: {type: 'validPort', default: 6600},
  mpdHost: {type: 'nonEmpty', default: 'localhost'},
  musicDir: {type: 'nonEmpty'},
  cacheDir: {type: 'nonEmpty'},
  logDir: {type: 'nonEmpty', default:  '.'},
  logLevel: {type: 'logLevel', default: 'info'}
};

export class Config {

  /**
   * The port to start the server
   */
  public readonly port!: number;

  /**
   * The hostname of the mpd server to connect to
   */
  public readonly mpdHost!: string;

  /**
   * The port of the mpd server to connect to
   */
  public readonly mpdPort!: number;

  /**
   * The directory to search for music.
   */
  public readonly musicDir!: string;

  /**
   * The directory to put cache data.
   */
  public readonly cacheDir!: string;

  /**
   * The directory to put log files.
   */
  public readonly logDir!: string;

   /**
    * The log level.
    */
  public readonly logLevel!: 'info'|'debug'|'warn'|'error';

  public constructor(values: any) {
    extractConfigValues(this, values);
  }

  /**
   * Read the config from a file.
   * @property {string} file the config file to read
   * @returns {Promise<Config>}
   */
  public static async readFromFile(file: string): Promise<Config> {
    return new Config(await readConfigFile(file));
  }

}

async function readConfigFile(file: string) {
  try {
    return await readJson(file);
  } catch (err) {
    throw new Error(`Could not read config file '${file}': ${err}`);
  }
}

function extractConfigValues(target: object, values: any) {
  for (let name in CONFIG_VARS) {
    let spec = CONFIG_VARS[name];
    if (!(name in values) && !('default' in spec)) {
      throw new Error('Missing config value: ' + name);
    }
    let value = name in values ? values[name] : spec.default;
    checkType(spec.type, value, configError(name));
    Object.defineProperty(target, name, {value});
  }
}

function checkType(type: string, value: any, handler: (message: string) => any) {
  if (type === 'validPort') return requireValidPort(value, handler);
  if (type === 'nonEmpty') return requireNonEmpty(value, handler);
  if (type === 'logLevel') return requireLogLevel(value, handler);
  throw new Error('invalid type ' + type);
}

function requireValidPort(number: number, handler: (message: string) => number): number {
  if (!Number.isInteger(number)) {
    return handler('not an integer: ' + number);
  }
  if (number <= 0 && number >= 65535) {
    return handler('out of range: ' + number);
  }
  return number;
}

function requireLogLevel(string: string, handler: (message: string) => string): string {
  string = requireNonEmpty(string, handler);
  if (!['debug', 'info', 'warn', 'error'].includes(string)) {
    return handler('not a valid log level: ' + string);
  }
  return string;
}

function requireNonEmpty(string: string, handler: (message: string) => string): string {
  if (typeof string !== 'string') {
    return handler('not a string: ' + string);
  }
  if (string.trim().length === 0) {
    return handler('empty string');
  }
  return string;
}

function configError(name: string) {
  return (message: string) => {
    throw new Error(`Invalid config value for '${name}': ${message}`);
  };
}

interface ConfigSpec {
  type: string;
  default?: any;
}
