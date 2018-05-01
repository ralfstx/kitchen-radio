import { join } from 'path';
import { crc32Str } from '../lib/hash';
import { Album } from './Album';
import { AlbumFinder } from './AlbumFinder';
import { Context } from './Context';
import { Logger } from './Logger';
import { CoverDB } from './CoverDB';

export class AlbumDB {

  private logger: Logger;
  private _coverDB: CoverDB;
  private _musicDir: string;
  private _albums: {[id: string]: Album};

  constructor(context: Context) {
    this.logger = context.logger;
    this._coverDB = context.coverDB;
    this._musicDir = context.config.musicDir;
    this._albums = {};
  }

  public addAlbum(album: Album, path: string) {
    let id = crc32Str(album.name);
    this._albums[id] = album;
    this._coverDB.storeAlbumCover(id, join(path, 'cover.jpg'));
  }

  public async update() {
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

  public getAlbum(id) {
    return this._albums[id] || null;
  }

  public getAlbumIds() {
    return Object.keys(this._albums);
  }

  public search(terms, limit = 20) {
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
