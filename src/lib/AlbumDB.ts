import {join} from 'path';
import {Context} from './Context'; // eslint-disable-line no-unused-vars
import {crc32Str} from '../lib/hash';
import {Album} from './Album'; // eslint-disable-line no-unused-vars
import {AlbumFinder} from './AlbumFinder';

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

  /**
   * @param {Album} album
   */
  addAlbum(album, path) {
    let id = crc32Str(album.name);
    album._id = id;
    this._albums[id] = album;
    this._coverDB.storeAlbumCover(id, join(path, 'cover.jpg'));
  }

  async update() {
    this._albums = {};
    this.logger.info('Searching for albums in ' + this._musicDir);
    let finder = new AlbumFinder({
      logger: this.logger,
      albumDB: this
    });
    await finder.find(this._musicDir);
    let count = Object.keys(this._albums).length;
    this.logger.info(`Found ${count} albums`);
    return {count};
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

}

function matches(string, terms) {
  if (!terms || !string) {
    return false;
  }
  let parts = string.toLowerCase().split(/\s/);
  return terms.every(term => parts.some(part => !part.indexOf(term.toLowerCase())));
}
