import {join} from 'path';

import logger from './logger';
import {getSubDirs, readJsonFile, statAsyncSafe} from './files';

export default class StationDB {

  constructor(stationsDir) {
    this._stationsDir = stationsDir;
    this._ids = [];
    this._stations = {};
  }

  async update() {
    this._ids = [];
    this._stations = {};
    logger.info('Updating stations in ' + this._stationsDir);
    let subdirs = await getSubDirs(this._stationsDir);
    for (let name of subdirs.filter(dir => !dir.startsWith('.'))) {
      let station = await this._readStation(name);
      if (!station) {
        logger.warn('Not a station: ' + join(this._stationsDir, name));
      } else if (!station.name) {
        logger.warn('Missing station name in: ' + join(this._stationsDir, name));
      } else {
        this._ids.push(name);
        this._stations[name] = station;
      }
    }
    return {count: this._ids.length};
  }

  async _readStation(path) {
    let indexFile = join(this._stationsDir, path, 'index.json');
    let stats = await statAsyncSafe(indexFile);
    if (!stats || !stats.isFile()) return null;
    let data = await readJsonFile(indexFile);
    return data; // TODO wrap in Album instance?
  }

  getStation(id) {
    return this._stations[id] || null;
  }

  getIndex() {
    return this._ids.map(id => Object.assign({id}, this._stations[id]));
  }

}
