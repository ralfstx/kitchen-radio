import { copy, mkdirs } from 'fs-extra';
import { resolve } from 'path';
import { resizeImage } from '../lib/images';
import { Context } from './Context';
import { statSafe } from './files';
import { Logger } from './Logger';
import { ensure } from './util';

const SIZE_CLASSES = [100, 250];

export class CoverDB {

  private _logger: Logger;
  private _coverDir: string;
  private _map: Map<string, string>;

  constructor(context: Context) {
    this._logger = ensure(context.logger).child('CoverDB');
    this._coverDir = resolve(ensure(context.config).cacheDir, 'cover');
    this._map = new Map();
  }

  public async init(): Promise<void> {
    await mkdirs(this._coverDir);
  }

  public async storeAlbumCover(id: string, srcFile: string): Promise<void> {
    let stats = await statSafe(srcFile);
    if (!stats || !stats.isFile()) {
      throw new Error(`Missing cover image '${srcFile}'`);
    }
    this._map.set(id, srcFile);
  }

  public async getAlbumCover(id: string, size = 0): Promise<string | null> {
    return await this._getCoverFile(id, getSizeClass(size));
  }

  private async _getCoverFile(id: string, size: number): Promise<string | null> {
    let origFile = this._map.get(id);
    if (!origFile) return null;
    let cacheFile = resolve(this._coverDir, id + '-' + size);
    await this._createCopy(origFile, cacheFile, size);
    let result = await statSafe(cacheFile) ? cacheFile : null;
    this._logger.info('created image copy', {id, size, result}); // TODO
    return result;
  }

  private async _createCopy(srcPath: string, dstPath: string, size: number): Promise<void> {
    let srcStats = await statSafe(srcPath);
    let dstStats = await statSafe(dstPath);
    this._logger.info('creating image copy', {srcPath, dstPath}); // TODO
    if (srcStats && srcStats.isFile() && (!dstStats || (dstStats.mtime < srcStats.mtime))) {
      try {
        if (size) {
          await resizeImage(srcPath, dstPath, size);
        } else {
          await copy(srcPath, dstPath);
        }
      } catch (err) {
        this._logger.error(`Unable to create cache copy '${dstPath}'`, {err});
      }
    }
  }

}

function getSizeClass(size: number): number {
  if (size) {
    for (let n of SIZE_CLASSES) {
      if (size <= n) return n;
    }
  }
  return 0;
}
