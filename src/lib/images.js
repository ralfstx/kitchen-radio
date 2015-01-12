/*
 * Utility methods for images.
 */

var Promise = require("bluebird");
var Magick = require("imagemagick");
var magickResize = Promise.promisify(Magick.resize);

exports.resizeImage = resizeImage;

function resizeImage(srcPath, dstPath, size) {
  return magickResize({
    srcPath: srcPath,
    dstPath: dstPath,
    width: size,
    height: size
  });
}
