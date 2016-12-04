import {join} from 'path';

import {getSubDirs, readJsonFile, statAsyncSafe} from './files';
import {Album} from './album-types';
import {resizeImage} from '../lib/images';

export default class AlbumDB {

  constructor(context) {
    this.logger = context.get('logger');
    this._albumsDir = context.get('albumsDir');
    this._albums = {};
  }

  async update() {
    this._albums = {};
    this.logger.info('Updating albums in ' + this._albumsDir);
    let subdirs = await getSubDirs(this._albumsDir);
    for (let name of subdirs.filter(dir => !dir.startsWith('.'))) {
      let album = await this._readAlbum(name);
      if (!album) {
        this.logger.warn('Not an album: ' + join(this._albumsDir, name));
      } else if (!album.name) {
        this.logger.warn('Missing album name in: ' + join(this._albumsDir, name));
      } else {
        this._albums[album.path] = album;
      }
    }
    return {count: Object.keys(this._albums).length};
  }

  async _readAlbum(path) {
    let indexFile = join(this._albumsDir, path, 'index.json');
    let stats = await statAsyncSafe(indexFile);
    if (!stats || !stats.isFile()) return null;
    let data = await readJsonFile(indexFile);
    return Album.fromJson(path, data);
  }

  async updateImages() {
    let log = {missing: [], written: []};
    this.logger.info('Updating album images in ' + this._albumsDir);
    for (let path in this._albums) {
      await this._updateAlbumImages(this._albums[path], log);
    }
    return log;
  }

  async _updateAlbumImages(album, log) {
    let origImage = join(this._albumsDir, album.path, 'cover.jpg');
    let origStats = await statAsyncSafe(origImage);
    if (!origStats) {
      this.logger.warn('Missing cover image: ' + origImage);
      log.missing.push(origImage);
      return;
    }
    for (let size of [100, 250]) {
      let dstPath = join(this._albumsDir, album.path, `cover-${size}.jpg`);
      let stats = await statAsyncSafe(dstPath);
      if (!stats || (stats.mtime < origStats.mtime)) {
        this.logger.info('writing ' + dstPath);
        log.written.push(dstPath);
        await resizeImage(origImage, dstPath, size);
      }
    }
  }

  getAlbum(path) {
    return this._albums[path] || null;
  }

  getAlbums() {
    return Object.keys(this._albums)
      .map(id => this._albums[id])
      .sort((a1, a2) => (a1.name < a2.name ? -1 : a1.name > a2.name ? 1 : 0));
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
