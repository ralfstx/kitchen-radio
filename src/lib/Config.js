import {readJson} from 'fs-extra';

const CONFIG_VARS = {
  port: 'validPort',
  mpdPort: 'validPort',
  mpdHost: 'nonEmpty',
  musicDir: 'nonEmpty',
  cacheDir: 'nonEmpty',
  logDir: 'nonEmpty',
  logLevel: 'logLevel',
};

const DEFAULT_CONFIG = {
  port: 8080,
  mpdPort: 6600,
  mpdHost: 'localhost',
  logDir: '.',
  logLevel: 'info',
};

export class Config {

  /**
   * @param {any} values
   */
  constructor(values) {
    /**
     * The port to start the server
     * @type {number}
     */
    this.port;

    /**
     * The hostname of the mpd server to connect to
     * @type {string}
     */
    this.mpdHost;

    /**
     * The port of the mpd server to connect to
     * @type {number}
     */
    this.mpdPort;

    /**
     * The directory to search for music.
     * @type {string}
     */
    this.musicDir;

    /**
     * The directory to put cache data.
     * @type {string}
     */
    this.cacheDir;

    /**
     * The directory to put log files.
     * @type {string}
     */
    this.logDir;

    /**
     * The log level.
     * @type {'info'|'debug'|'warn'|'error'}
     */
    this.logLevel;

    extractConfigValues(this, Object.assign({}, DEFAULT_CONFIG, values));
  }

  /**
   * Read the config from a file.
   * @property {string} file the config file to read
   * @returns {Promise<Config>}
   */
  static async readFromFile(file) {
    return new Config(await readConfigFile(file));
  }

}

async function readConfigFile(file) {
  try {
    return await readJson(file);
  } catch (err) {
    throw new Error(`Could not read config file '${file}': ${err}`);
  }
}

function extractConfigValues(target, values) {
  for (let name in CONFIG_VARS) {
    let type = CONFIG_VARS[name];
    if (!(name in values)) throw new Error('Missing config value: ' + name);
    let value = checkType(type, values[name], configError(name));
    Object.defineProperty(target, name, {value});
  }
}

function checkType(type, value, handler) {
  if (type === 'validPort') return requireValidPort(value, handler);
  if (type === 'nonEmpty') return requireNonEmpty(value, handler);
  if (type === 'logLevel') return requireLogLevel(value, handler);
}

/**
 * @param {number} number
 * @param {(message: string) => number} handler
 * @returns {number}
 */
function requireValidPort(number, handler) {
  if (!Number.isInteger(number)) {
    return handler('not an integer: ' + number);
  }
  if (number <= 0 && number >= 65535) {
    return handler('out of range: ' + number);
  }
  return number;
}

/**
 * @param {string} string
 * @param {(message: string) => string} handler
 * @returns {string}
 */
function requireLogLevel(string, handler) {
  string = requireNonEmpty(string, handler);
  if (!['debug', 'info', 'warn', 'error'].includes(string)) {
    return handler('not a valid log level: ' + string);
  }
  return string;
}

/**
 * @param {string} string
 * @param {(message: string) => string} handler
 * @returns {string}
 */
function requireNonEmpty(string, handler) {
  if (typeof string !== 'string') {
    return handler('not a string: ' + string);
  }
  if (string.trim().length === 0) {
    return handler('empty string');
  }
  return string;
}

function configError(name) {
  return message => {
    throw new Error(`Invalid config value for '${name}': ${message}`);
  };
}
