/*
 * Utility methods for images.
 */
import magick from 'imagemagick';
import {promisify} from './util';

let magickResize = promisify(magick.resize);

export function resizeImage(srcPath, dstPath, size) {
  return magickResize({
    srcPath: srcPath,
    dstPath: dstPath,
    width: size,
    height: size
  });
}
