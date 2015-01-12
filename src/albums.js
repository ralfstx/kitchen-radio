
var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");

var Config = require("./lib/config");
var Logger = require("./lib/logger");
var Util = require("./lib/util");
var Files = require("./lib/files");
var Images = require("./lib/images");

var Server = require("./server");

var albumsDir = Path.join(Config.musicDir, "albums");

exports.get = function(request, response, path) {
  if (path === "update") {
    return updateIndex().then(function() {
      return Server.writeJson(response, "ok");
    });
  }
  if (path === "update-images") {
    return updateImages().then(function() {
      return Server.writeJson(response, "ok");
    });
  }
  throw Server.createError(404, "Not found: '" + path + "'");
};

function updateIndex() {
  var indexFile = Path.join(albumsDir, "index.json");
  console.log("update", indexFile);
  return buildIndex().then(function(index) {
    console.log("writing", indexFile);
    return Fs.writeFileAsync(indexFile, Util.toJson(index));
  });
}

function buildIndex() {
  return Files.getSubDirs(albumsDir).map(function(subdir) {
    return getAlbumInfo(subdir);
  });
}

function getAlbumInfo(subdir) {
  var indexFile = Path.join(albumsDir, subdir, "index.json");
  return Files.ensureIsFile(indexFile).then(function() {
    return Files.readJsonFile(indexFile).then(function(data) {
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
  return Files.getSubDirs(albumsDir).map(function(subdir) {
    return updateAlbumImages(Path.join(albumsDir, subdir));
  });
}

function updateAlbumImages(albumDir) {
  var srcPath = Path.join(albumDir, "cover.jpg");
  Files.statAsyncSafe(srcPath).then(function(origStats) {
    if (!origStats) {
      console.error("Missing: " + srcPath);
    } else {
      return Promise.resolve([100, 250]).each(function(size) {
        var dstPath = Path.join(albumDir, "cover-" + size + ".jpg");
        return Files.statAsyncSafe(dstPath).then(function(stats) {
          if (!stats || stats.mtime > origStats.mtime) {
            console.log("writing", dstPath);
            return Images.resizeImage(srcPath, dstPath, size);
          }
        });
      });
    }
  });
}
