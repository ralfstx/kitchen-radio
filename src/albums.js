let Promise = require('bluebird');
let Fs = Promise.promisifyAll(require('fs'));
let Path = require('path');
let _ = require('underscore');

let Config = require('./lib/config');
let Logger = require('./lib/logger');
let Util = require('./lib/util');
let Files = require('./lib/files');
let Images = require('./lib/images');
let Server = require('./lib/server');

let albumsDir = Path.join(Config.get('musicDir'), 'albums');

exports.requestHandlers = {
  'albums': handleRequest
};

exports.updateImages = updateImages;

function handleRequest(request, response, path) {
  if (path === 'update') {
    return updateIndex()
      .then(() => Server.writeJson(response, 'ok'));
  }
  if (path === 'update-images') {
    return updateImages()
      .then(results => Server.writeJson(response, _.extend({status: 'ok'}, results)));
  }
  throw Server.createError(404, "Not found: '" + path + "'");
}

function updateIndex() {
  let indexFile = Path.join(albumsDir, 'index.json');
  return buildIndex().then(index => Fs.writeFileAsync(indexFile, Util.toJson(index)));
}

function buildIndex() {
  return Files.getSubDirs(albumsDir).map(subdir => getAlbumInfo(subdir));
}

function getAlbumInfo(subdir) {
  let indexFile = Path.join(albumsDir, subdir, 'index.json');
  return Files.ensureIsFile(indexFile).then(() => {
    return Files.readJsonFile(indexFile).then(data => {
      if (!data.name) {
        Logger.warn("Missing album name for '" + subdir + "'");
      }
      return {
        path: subdir,
        name: data.name
      };
    });
  });
}

function updateImages() {
  let log = {missing: [], written: []};
  return Files.getSubDirs(albumsDir)
    .each(subdir => updateAlbumImages(Path.join(albumsDir, subdir), log))
    .then(() => log);
}

function updateAlbumImages(albumDir, log) {
  let srcPath = Path.join(albumDir, 'cover.jpg');
  return Files.statAsyncSafe(srcPath).then(origStats => {
    if (!origStats) {
      Logger.error('Missing cover image: ' + srcPath);
      log.missing.push(srcPath);
      return;
    }
    return Promise.resolve([100, 250]).map(size => {
      let dstPath = Path.join(albumDir, 'cover-' + size + '.jpg');
      return Files.statAsyncSafe(dstPath).then(stats => {
        if (!stats || (stats.mtime < origStats.mtime)) {
          Logger.info('writing ' + dstPath);
          log.written.push(dstPath);
          return Images.resizeImage(srcPath, dstPath, size);
        }
      });
    });
  });
}
