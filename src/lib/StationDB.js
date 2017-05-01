import {join} from 'path';
import {readJson} from 'fs-extra';

import {getSubDirs, statSafe} from './files';

export default class StationDB {

  constructor(context) {
    this.logger = context.logger;
    this._musicDir = context.musicDir;
    this._ids = [];
    this._stations = {};
  }

  async update() {
    this._ids = [];
    this._stations = {};
    this.logger.info('Updating stations in ' + this._musicDir);
    let stationsDir = join(this._musicDir, 'stations');
    let subdirs = await getSubDirs(stationsDir);
    for (let name of subdirs.filter(dir => !dir.startsWith('.'))) {
      let station = await this._readStation(join('stations', name));
      if (!station) {
        this.logger.warn('Not a station: ' + join(stationsDir, name));
      } else if (!station.name) {
        this.logger.warn('Missing station name in: ' + join(stationsDir, name));
      } else {
        this._ids.push(name);
        this._stations[name] = station;
      }
    }
    return {count: this._ids.length};
  }

  async _readStation(path) {
    let indexFile = join(this._musicDir, path, 'index.json');
    let stats = await statSafe(indexFile);
    if (!stats || !stats.isFile()) return null;
    // TODO wrap in Album instance?
    let station = await readJson(indexFile);
    station.path = path;
    return station;
  }

  getStation(id) {
    return this._stations[id] || null;
  }

  getIndex() {
    return this._ids.map(id => Object.assign({id}, this._stations[id]));
  }

}
