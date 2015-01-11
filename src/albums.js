
var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");

var Config = require("./lib/config");
var Logger = require("./lib/logger");
var Util = require("./lib/util");
var Files = require("./lib/files");

var Server = require("./server");

var albumsDir = Path.join(Config.baseDir, "albums");

exports.get = function(request, response, path) {
  return path ? writeAlbumFile(response, path) : writeAlbumsList(response);
};

function writeAlbumFile(response, path) {
  var file = Path.join(albumsDir, path);
  return Files.statAsyncSafe(file).then(function(stats) {
    if (!stats) {
      throw Server.error(404, "Not found: '" + file + "'");
    } else if (stats.isDirectory()) {
      var indexFile = Path.join(file, "index.json");
      return Files.ensureIsFile(indexFile).then(function() {
        return Server.writeFile(response, indexFile);
      });
    } else {
      return Server.writeFile(response, file);
    }
  });
}

function writeAlbumsList(response) {
  var indexFile = Path.join(albumsDir, "index.json");
  return Files.statAsyncSafe(indexFile).then(function(stats) {
    if (!stats) {
      return buildIndex().then(function(index) {
        return Fs.writeFileAsync(indexFile, Util.toJson(index));
      });
    }
  }).then(function() {
    return Server.writeFile(response, indexFile);
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
