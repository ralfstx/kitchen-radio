import { join } from 'path';
import { crc32Str } from '../lib/hash';
import { Album } from './Album';
import { AlbumFinder } from './AlbumFinder';
import { Context } from './Context';
import { CoverDB } from './CoverDB';
import { Logger } from './Logger';
import { Track } from './Track';
import { ensure } from './util';

export class AlbumDB {

  private _logger: Logger;
  private _coverDB: CoverDB;
  private _musicDir: string;
  private _albums: {[id: string]: Album};

  constructor(context: Context) {
    this._logger = ensure(context.logger);
    this._coverDB = ensure(context.coverDB);
    this._musicDir = ensure(context.config).musicDir;
    this._albums = {};
  }

  public addAlbum(album: Album, path: string) {
    let id = crc32Str(album.name);
    this._albums[id] = album;
    this._coverDB.storeAlbumCover(id, join(path, 'cover.jpg'));
  }

  public async update(): Promise<{count: number}> {
    this._albums = {};
    this._logger.info('Searching for albums in ' + this._musicDir);
    let finder = new AlbumFinder({
      logger: this._logger,
      albumDB: this
    });
    await finder.find(this._musicDir);
    let count = Object.keys(this._albums).length;
    this._logger.info(`Found ${count} albums`);
    return {count};
  }

  public getAlbum(id: string): Album | null {
    return this._albums[id] || null;
  }

  public getAlbumIds(): string[] {
    return Object.keys(this._albums);
  }

  public search(terms: string[], limit = 20): AlbumSearchResult[] {
    let result = [];
    for (let id in this._albums) {
      let album = this._albums[id];
      let tracks = album.tracks.filter(track => matches(track.title, terms));
      if (tracks.length || matches(album.name, terms)) {
        result.push({id, album, tracks});
        if (result.length >= limit) return result;
      }
    }
    return result;
  }

}

function matches(string: string, terms: string[]): boolean {
  if (!terms || !string) {
    return false;
  }
  let parts = string.toLowerCase().split(/\s/);
  return terms.every(term => parts.some(part => !part.indexOf(term.toLowerCase())));
}

interface AlbumSearchResult {
  id: string;
  album: Album;
  tracks: Track[];
}
