import {resolve} from 'path';
import {mkdirs, copy} from 'fs-extra';
import {resizeImage} from '../lib/images';
import {statSafe} from './files';

const SIZE_CLASSES = [100, 250];

export class CoverDB {

  constructor(context) {
    this.ctx = context;
    this.logger = context.logger;
    this._coverDir = resolve(this.ctx.cacheDir, 'cover');
    this._map = {};
  }

  async init() {
    await mkdirs(this._coverDir);
  }

  async getAlbumCover(id, size = 0) {
    let album = this.ctx.albumDB.getAlbum(id);
    if (!album) return null;
    return await this._getCoverFile(album, getSizeClass(size));
  }

  async _getCoverFile(album, size) {
    let origFile = this._map[album.id];
    let cacheFile = resolve(this._coverDir, album.id + '-' + size);
    await this._createCopy(origFile, cacheFile, size);
    return await statSafe(cacheFile) ? cacheFile : null;
  }

  async _createCopy(srcPath, dstPath, size) {
    let srcStats = await statSafe(srcPath);
    let dstStats = await statSafe(dstPath);
    if (srcStats && srcStats.isFile() && (!dstStats || (dstStats.mtime < srcStats.mtime))) {
      try {
        if (size) {
          await resizeImage(srcPath, dstPath, size);
        } else {
          await copy(srcPath, dstPath);
        }
      } catch (err) {
        this.logger.error(`Unable to create cache copy '${dstPath}'`, err);
      }
    }
  }

  storeAlbumCover(id, srcFile) {
    this._map[id] = srcFile;
  }

}

function getSizeClass(size) {
  if (size) {
    for (let n of SIZE_CLASSES) {
      if (size <= n) return n;
    }
  }
  return 0;
}
