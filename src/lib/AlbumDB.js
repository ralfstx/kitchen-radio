import {join, basename, relative} from 'path';
import {readJson, readdir} from 'fs-extra';
import {statSafe} from './files';
import {createAlbumFromIndex} from './AlbumIndex';
import {Context} from './Context'; // eslint-disable-line no-unused-vars
import {crc32Str} from '../lib/hash';

export class AlbumDB {

  /**
   * @param {Context} context
   */
  constructor(context) {
    this.logger = context.logger;
    this._coverDB = context.coverDB;
    this._musicDir = context.config.musicDir;
    this._albums = {};
  }

  async update() {
    this._albums = {};
    this.logger.info('Searching for albums in ' + this._musicDir);
    await this._processPath(this._musicDir);
    let found = Object.keys(this._albums).length;
    this.logger.info(`Found ${found} albums`);
  }

  async _processPath(path) {
    if (this._isExcluded(path)) return;
    let stats = await statSafe(path);
    if (stats && stats.isDirectory()) {
      let indexFile = join(path, 'index.json');
      let indexStats = await statSafe(indexFile);
      if (indexStats) {
        await this._loadAlbumFromIndex(path);
      } else {
        for (let file of await this._readdirSafe(path)) {
          await this._processPath(join(path, file));
        }
      }
    }
  }

  async _loadAlbumFromIndex(path) {
    let indexFile = join(path, 'index.json');
    let data = await this._readJsonSafe(indexFile);
    if (!data) return;
    if (!data.name) {
      this.logger.warn(`Album name missing in '${path}'`);
      return;
    }
    let id = crc32Str(data.name);
    this._albums[id] = createAlbumFromIndex(id, relative(this._musicDir, path), data);
    await this._coverDB.storeAlbumCover(id, join(path, 'cover.jpg'));
  }

  _isExcluded(path) {
    return basename(path).startsWith('.') || path.endsWith('~');
  }

  getAlbum(id) {
    return this._albums[id] || null;
  }

  getAlbumIds() {
    return Object.keys(this._albums);
  }

  search(terms, limit = 20) {
    let result = [];
    for (let id in this._albums) {
      let album = this._albums[id];
      let tracks = album.tracks.filter(track => matches(track.title, terms));
      if (tracks.length || matches(album.name, terms)) {
        result.push({album, tracks});
        if (result.length >= limit) return result;
      }
    }
    return result;
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

function matches(string, terms) {
  if (!terms || !string) {
    return false;
  }
  let parts = string.toLowerCase().split(/\s/);
  return terms.every(term => parts.some(part => !part.indexOf(term.toLowerCase())));
}
