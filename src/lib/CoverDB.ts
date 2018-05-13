import { copy, mkdirs } from 'fs-extra';
import { resolve } from 'path';
import { resizeImage } from '../lib/images';
import { Context } from './Context';
import { Logger } from './Logger';
import { statSafe } from './files';
import { ensure } from './util';

const SIZE_CLASSES = [100, 250];

export class CoverDB {

  private _logger: Logger;
  private _coverDir: string;
  private _map: Map<string, string>;

  constructor(context: Context) {
    this._logger = ensure(context.logger);
    this._coverDir = resolve(ensure(context.config).cacheDir, 'cover');
    this._map = new Map();
  }

  public async init(): Promise<void> {
    await mkdirs(this._coverDir);
  }

  public async getAlbumCover(id: string, size = 0): Promise<string | null> {
    return await this._getCoverFile(id, getSizeClass(size));
  }

  private async _getCoverFile(id: string, size: number): Promise<string | null> {
    let origFile = this._map.get(id);
    if (!origFile) return null;
    let cacheFile = resolve(this._coverDir, id + '-' + size);
    await this._createCopy(origFile, cacheFile, size);
    return await statSafe(cacheFile) ? cacheFile : null;
  }

  private async _createCopy(srcPath: string, dstPath: string, size: number): Promise<void> {
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
        this._logger.error(`Unable to create cache copy '${dstPath}'`, err);
      }
    }
  }

  public storeAlbumCover(id: string, srcFile: string): void {
    this._map.set(id, srcFile);
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
