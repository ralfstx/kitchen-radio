import { resize } from 'imagemagick';
import { promisify } from './util';

/*
 * Utility methods for images.
 */

let magickResize = promisify(resize);

export function resizeImage(srcPath: string, dstPath: string, size: number) {
  return magickResize({
    srcPath,
    dstPath,
    width: size,
    height: size
  });
}
