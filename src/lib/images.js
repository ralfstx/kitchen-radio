/*
 * Utility methods for images.
 */
import Promise from 'bluebird';
import magick from 'imagemagick';
let magickResize = Promise.promisify(magick.resize);

export function resizeImage(srcPath, dstPath, size) {
  return magickResize({
    srcPath: srcPath,
    dstPath: dstPath,
    width: size,
    height: size
  });
}
