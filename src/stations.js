
var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");

var Config = require("./lib/config.js");
var Util = require("./lib/util.js");
var Files = require("./lib/files");

var Server = require("./server.js");

var stationsDir = Path.join(Config.baseDir, "stations");

exports.list = function(response) {
  var filepath = Path.join(stationsDir, "index.json");
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
  return Files.getSubDirs(stationsDir).map(function(dir) {
    return getStationInfo(dir);
  });
}

function getStationInfo(dir) {
  var path = Path.join(stationsDir, dir, "index.json");
  return Files.ensureIsFile(path).then(function() {
    return Files.readJsonFile(path).then(function(data) {
      return data;
    });
  });
}
