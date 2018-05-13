import { readJson, readdir } from 'fs-extra';
import { basename, dirname, join } from 'path';
import { Context } from './Context';
import { Logger } from './Logger';
import { statSafe } from './files';
import { ensure } from './util';

export class StationDB {

  private _logger: Logger;
  private _musicDir: string;
  private _ids: string[];
  private _stations: Map<string, any>;

  constructor(context: Context) {
    this._logger = ensure(context.logger);
    this._musicDir = ensure(context.config).musicDir;
    this._ids = [];
    this._stations = new Map();
  }

  public async update() {
    this._ids = [];
    this._stations.clear();
    let stationsDir = join(this._musicDir, 'stations');
    this._logger.info('Searching for stations in ' + stationsDir);
    await this._processPath(stationsDir);
    let count = this._ids.length;
    this._logger.info(`Found ${count} stations`);
    return {count};
  }

  private async _processPath(path: string) {
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

  private async _readStation(indexFile: string) {
    // TODO wrap in Album instance?
    let station = await this._readJsonSafe(indexFile);
    if (!station) return;
    if (!station.id) {
      this._logger.warn('Missing station id in: ' + indexFile);
    }
    if (!station.name) {
      this._logger.warn('Missing station name in: ' + indexFile);
    }
    station.path = dirname(indexFile);
    this._registerStation(station);
  }

  private _registerStation(station: any) {
    let id = station.id;
    this._ids.push(id);
    this._stations.set(id, station);
  }

  public getStationIds() {
    return this._ids.concat();
  }

  public getStation(id: string) {
    return this._stations.get(id) || null;
  }

  private async _readdirSafe(dir: string) {
    try {
      return await readdir(dir);
    } catch (err) {
      this._logger.warn(`Could not read dir '${dir}'`);
      return [];
    }
  }

  private async _readJsonSafe(file: string) {
    try {
      return await readJson(file);
    } catch (err) {
      this._logger.warn(`Could not read JSON file '${file}'`);
      return null;
    }
  }

}
