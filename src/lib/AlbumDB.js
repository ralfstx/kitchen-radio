import {join} from 'path';

import logger from './logger';
import {getSubDirs, readJsonFile, statAsyncSafe} from './files';
import {Album} from './album-types';
import {resizeImage} from '../lib/images';

export default class AlbumDB {

  constructor(albumsDir) {
    this._albumsDir = albumsDir;
    this._albums = {};
  }

  async update() {
    this._albums = {};
    logger.info('Updating albums in ' + this._albumsDir);
    let subdirs = await getSubDirs(this._albumsDir);
    for (let name of subdirs.filter(dir => !dir.startsWith('.'))) {
      let album = await this._readAlbum(name);
      if (!album) {
        logger.warn('Not an album: ' + join(this._albumsDir, name));
      } else if (!album.name) {
        logger.warn('Missing album name in: ' + join(this._albumsDir, name));
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
    logger.info('Updating album images in ' + this._albumsDir);
    for (let path in this._albums) {
      await this._updateAlbumImages(this._albums[path], log);
    }
    return log;
  }

  async _updateAlbumImages(album, log) {
    let origImage = join(this._albumsDir, album.path, 'cover.jpg');
    let origStats = await statAsyncSafe(origImage);
    if (!origStats) {
      logger.warn('Missing cover image: ' + origImage);
      log.missing.push(origImage);
      return;
    }
    for (let size of [100, 250]) {
      let dstPath = join(this._albumsDir, album.path, `cover-${size}.jpg`);
      let stats = await statAsyncSafe(dstPath);
      if (!stats || (stats.mtime < origStats.mtime)) {
        logger.info('writing ' + dstPath);
        log.written.push(dstPath);
        await resizeImage(origImage, dstPath, size);
      }
    }
  }

  getAlbum(path) {
    return this._albums[path] || null;
  }

  getIndex() {
    return Object.keys(this._albums)
      .map(path => this._albums[path])
      .map(album => ({path: album.path, name: album.name}));
  }

}
