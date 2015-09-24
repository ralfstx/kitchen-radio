var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");
var _ = require("underscore");

var Config = require("./lib/config");
var Logger = require("./lib/logger");
var Util = require("./lib/util");
var Files = require("./lib/files");
var Images = require("./lib/images");
var Server = require("./lib/server");

var albumsDir = Path.join(Config.get("musicDir"), "albums");

exports.requestHandlers = {
  "albums": handleRequest
};

exports.updateImages = updateImages;

function handleRequest(request, response, path) {
  if (path === "update") {
    return updateIndex()
      .then(() => Server.writeJson(response, "ok"));
  }
  if (path === "update-images") {
    return updateImages()
      .then(results => Server.writeJson(response, _.extend({status: "ok"}, results)));
  }
  throw Server.createError(404, "Not found: '" + path + "'");
}

function updateIndex() {
  var indexFile = Path.join(albumsDir, "index.json");
  return buildIndex().then(index => Fs.writeFileAsync(indexFile, Util.toJson(index)));
}

function buildIndex() {
  return Files.getSubDirs(albumsDir).map(subdir => getAlbumInfo(subdir));
}

function getAlbumInfo(subdir) {
  var indexFile = Path.join(albumsDir, subdir, "index.json");
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
  var log = {missing: [], written: []};
  return Files.getSubDirs(albumsDir)
    .each(subdir => updateAlbumImages(Path.join(albumsDir, subdir), log))
    .then(() => log);
}

function updateAlbumImages(albumDir, log) {
  var srcPath = Path.join(albumDir, "cover.jpg");
  return Files.statAsyncSafe(srcPath).then(origStats => {
    if (!origStats) {
      Logger.error("Missing cover image: " + srcPath);
      log.missing.push(srcPath);
      return;
    }
    return Promise.resolve([100, 250]).map(size => {
      var dstPath = Path.join(albumDir, "cover-" + size + ".jpg");
      return Files.statAsyncSafe(dstPath).then(stats => {
        if (!stats || (stats.mtime < origStats.mtime)) {
          Logger.info("writing " + dstPath);
          log.written.push(dstPath);
          return Images.resizeImage(srcPath, dstPath, size);
        }
      });
    });
  });
}
