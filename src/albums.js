
var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");

var Config = require("./lib/config.js");
var Logger = require("./lib/logger.js");
var Util = require("./lib/util.js");
var Files = require("./lib/files");

var Server = require("./server.js");

var albumsDir = Path.join(Config.baseDir, "albums");

exports.list = function(response) {
  var filepath = Path.join(albumsDir, "index.json");
  return Files.statAsyncSafe(filepath).then(function(stats) {
    if (!stats) {
      return buildIndex().then(function(index) {
        return Fs.writeFileAsync(filepath, Util.toJson(index));
      });
    }
  }).then(function() {
    return Server.writeFile(response, filepath);
  });
};

function buildIndex() {
  return Files.getSubDirs(albumsDir).map(function(dir) {
    return getAlbumInfo(dir);
  });
}

function getAlbumInfo(dir) {
  var path = Path.join(albumsDir, dir, "index.json");
  return Files.ensureIsFile(path).then(function() {
    return Files.readJsonFile(path).then(function(data) {
      if (!data.name) {
        Logger.warn("Missing album name for '" + dir + "'");
      }
      return {
        path: dir,
        name: data.name
      };
    });
  });
}
