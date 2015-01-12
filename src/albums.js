
var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");

var Config = require("./lib/config");
var Logger = require("./lib/logger");
var Util = require("./lib/util");
var Files = require("./lib/files");

var Server = require("./server");

var albumsDir = Path.join(Config.musicDir, "albums");

exports.get = function(request, response, path) {
  if (path === "update") {
    return updateAlbums().then(function() {
      return Server.writeJson(response, "ok");
    });
  }
  throw Server.createError(404, "Not found: '" + path + "'");
};

function updateAlbums() {
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
