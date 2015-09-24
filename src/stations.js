
var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");

var Config = require("./lib/config");
var Util = require("./lib/util");
var Files = require("./lib/files");

var Server = require("./server");

var stationsDir = Path.join(Config.musicDir, "stations");

exports.requestHandlers = {
  "/stations": handleRequest
};

function handleRequest(request, response, path) {
  if (path === "update") {
    return updateStations().then(function() {
      return Server.writeJson(response, "ok");
    });
  }
  throw Server.createError(404, "Not found: '" + path + "'");
}

function updateStations() {
  var indexFile = Path.join(stationsDir, "index.json");
  return buildIndex().then(function(index) {
    return Fs.writeFileAsync(indexFile, Util.toJson(index));
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
