
var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");

var Config = require("./lib/config.js");
var Util = require("./lib/util.js");
var Files = require("./lib/files");

var Server = require("./server.js");

var stationsDir = Path.join(Config.baseDir, "stations");

exports.get = function(response, path) {
  return path ? writeStationFile(response, path) : writeStationsList(response);
};

function writeStationFile(response, path) {
  var file = Path.join(stationsDir, path);
  return Files.statAsyncSafe(file).then(function(stats) {
    if (!stats) {
      throw new Error("Not found: '" + file + "'");
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

function writeStationsList(response) {
  var indexFile = Path.join(stationsDir, "index.json");
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
  return Files.getSubDirs(stationsDir).map(function(subdir) {
    return getStationInfo(subdir);
  });
}

function getStationInfo(subdir) {
  var indexFile = Path.join(stationsDir, subdir, "index.json");
  return Files.ensureIsFile(indexFile).then(function() {
    return Files.readJsonFile(indexFile);
  });
}
