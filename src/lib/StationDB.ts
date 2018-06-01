import { readJson, readdir } from 'fs-extra';
import { join } from 'path';
import { Context } from './Context';
import { Logger } from './Logger';
import { statSafe } from './files';
import { ensure } from './util';

export class StationDB {

  private _logger: Logger;
  private _baseDir: string;
  private _ids: string[];
  private _stations: Map<string, any>;

  constructor(context: Context) {
    this._logger = ensure(context.logger);
    this._baseDir = ensure(context.config).musicDir;
    this._ids = [];
    this._stations = new Map();
  }

  public async update() {
    this._ids = [];
    this._stations.clear();
    this._logger.info('Searching for stations in ' + this._baseDir);
    await this._processPath('stations');
    let count = this._ids.length;
    this._logger.info(`Found ${count} stations`);
    return {count};
  }

  private async _processPath(path: string) {
    let dir = join(this._baseDir, path);
    let stats = await statSafe(dir);
    if (stats && stats.isDirectory()) {
      if (await this._hasIndex(path)) {
        await this._readStation(path);
      } else {
        for (let file of await this._readdirSafe(dir)) {
          await this._processPath(join(path, file));
        }
      }
    }
  }

  private async _hasIndex(path: string) {
    let indexFile = join(this._baseDir, path, 'station.json');
    let stats = await statSafe(indexFile);
    return stats && stats.isFile();
  }

  private async _readStation(path: string) {
    // TODO wrap in Album instance?
    let indexFile = join(this._baseDir, path, 'station.json');
    let station = await this._readJsonSafe(indexFile);
    if (!station) return;
    if (!station.id) {
      this._logger.warn('Missing station id in: ' + indexFile);
    }
    if (!station.name) {
      this._logger.warn('Missing station name in: ' + indexFile);
    }
    station.path = path;
    this._registerStation(station);
  }

  private _registerStation(station: any) {
    this._logger.debug('adding station', station.path);
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
