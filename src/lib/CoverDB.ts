import {resolve} from 'path';
import {mkdirs, copy} from 'fs-extra';
import {resizeImage} from '../lib/images';
import {statSafe} from './files';
import {AlbumDB} from './AlbumDB'; // eslint-disable-line no-unused-vars
import {Logger} from './Logger'; // eslint-disable-line no-unused-vars
import {Context} from './Context'; // eslint-disable-line no-unused-vars

const SIZE_CLASSES = [100, 250];

export class CoverDB {

  /**
   * @param {Context} context
   */
  constructor(context) {
    this.logger = context.logger;
    this._coverDir = resolve(context.config.cacheDir, 'cover');
    this._map = {};
  }

  async init() {
    await mkdirs(this._coverDir);
  }

  async getAlbumCover(id, size = 0) {
    return await this._getCoverFile(id, getSizeClass(size));
  }

  async _getCoverFile(id, size) {
    let origFile = this._map[id];
    if (!origFile) return null;
    let cacheFile = resolve(this._coverDir, id + '-' + size);
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
