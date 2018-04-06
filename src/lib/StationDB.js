import {join, basename, dirname} from 'path';
import {readJson, readdir} from 'fs-extra';
import {statSafe} from './files';

export class StationDB {

  constructor(context) {
    this.logger = context.logger;
    this._musicDir = context.musicDir;
    this._ids = [];
    this._stations = {};
  }

  async update() {
    this._ids = [];
    this._stations = {};
    let stationsDir = join(this._musicDir, 'stations');
    this.logger.info('Searching for stations in ' + stationsDir);
    await this._processPath(stationsDir);
    this.logger.info(`Found ${this._ids.length} stations`);
  }

  async _processPath(path) {
    let stats = await statSafe(path);
    if (stats && stats.isDirectory()) {
      for (let file of await this._readdirSafe(path)) {
        await this._processPath(join(path, file));
      }
    } else if (stats && stats.isFile()) {
      if (basename(path) === 'station.json') {
        await this._readStation(path);
      }
    }
  }

  async _readStation(indexFile) {
    // TODO wrap in Album instance?
    let station = await this._readJsonSafe(indexFile);
    if (!station) return;
    if (!station.id) {
      this.logger.warn('Missing station id in: ' + indexFile);
    }
    if (!station.name) {
      this.logger.warn('Missing station name in: ' + indexFile);
    }
    station.path = dirname(indexFile);
    this._registerStation(station);
  }

  _registerStation(station) {
    let id = station.id;
    this._ids.push(id);
    this._stations[id] = station;
  }

  getStationIds() {
    return this._ids.concat();
  }

  getStation(id) {
    return this._stations[id] || null;
  }

  async _readdirSafe(dir) {
    try {
      return await readdir(dir);
    } catch (err) {
      this.logger.warn(`Could not read dir '${dir}'`);
      return [];
    }
  }

  async _readJsonSafe(file) {
    try {
      return await readJson(file);
    } catch (err) {
      this.logger.warn(`Could not read JSON file '${file}'`);
      return null;
    }
  }

}
