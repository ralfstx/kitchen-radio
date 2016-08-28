
let Promise = require('bluebird');
let Fs = Promise.promisifyAll(require('fs'));
let Path = require('path');

let Config = require('./lib/config');
let Util = require('./lib/util');
let Files = require('./lib/files');
let Server = require('./lib/server');

let stationsDir = Path.join(Config.get('musicDir'), 'stations');

exports.requestHandlers = {
  'stations': handleRequest
};

function handleRequest(request, response, path) {
  console.log('stations', path);
  if (path === 'update') {
    return updateStations()
      .then(() => Server.writeJson(response, 'ok'));
  }
  throw Server.createError(404, "Not found: '" + path + "'");
}

function updateStations() {
  let indexFile = Path.join(stationsDir, 'index.json');
  return buildIndex()
    .then(index => Fs.writeFileAsync(indexFile, Util.toJson(index)));
}

function buildIndex() {
  return Files.getSubDirs(stationsDir)
    .map(subdir => getStationInfo(subdir));
}

function getStationInfo(subdir) {
  let indexFile = Path.join(stationsDir, subdir, 'index.json');
  return Files.ensureIsFile(indexFile)
    .then(() => Files.readJsonFile(indexFile));
}
