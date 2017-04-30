import {resolve} from 'path';
import {resizeImage} from '../lib/images';
import {statSafe} from './files';
import {mkdirsAsync, copyAsync} from './fs-async';

const SIZE_CLASSES = [100, 250];

export default class CoverDB {

  constructor(context) {
    this.logger = context.logger;
    this._musicDir = context.musicDir;
    this._cacheDir = context.cacheDir;
    this._albumDB = context.albumDB;
  }

  async getAlbumCover(id, size = 0) {
    let album = this._albumDB.getAlbum(id);
    if (!album) return null;
    return await this._getCoverFile(album, getSizeClass(size));
  }

  async _getCoverFile(album, size) {
    await mkdirsAsync(resolve(this._cacheDir, 'cover'));
    let cacheFile = resolve(this._cacheDir, 'cover', album.id + '-' + size);
    let origFile = resolve(this._musicDir, album.location, 'cover.jpg');
    await this._createCopy(origFile, cacheFile, size);
    return await statSafe(cacheFile) ? cacheFile : null;
  }

  async _createCopy(srcPath, dstPath, size) {
    let srcStats = await statSafe(srcPath);
    let dstStats = await statSafe(dstPath);
    if (srcStats && (!dstStats || (dstStats.mtime < srcStats.mtime))) {
      try {
        if (size) {
          await resizeImage(srcPath, dstPath, size);
        } else {
          await copyAsync(srcPath, dstPath);
        }
      } catch (err) {
        console.error(err);
      }
    }
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
