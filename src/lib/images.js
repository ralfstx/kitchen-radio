/*
 * Utility methods for images.
 */

let Promise = require('bluebird');
let Magick = require('imagemagick');
let magickResize = Promise.promisify(Magick.resize);

exports.resizeImage = resizeImage;

function resizeImage(srcPath, dstPath, size) {
  return magickResize({
    srcPath: srcPath,
    dstPath: dstPath,
    width: size,
    height: size
  });
}
