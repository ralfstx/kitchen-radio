import {join} from 'path';

import config from './lib/config';
import {toJson} from './lib/util';
import {getSubDirs, ensureIsFile, readJsonFile, writeFileAsync} from './lib/files';
import * as server from'./lib/server';

let stationsDir = join(config.get('musicDir'), 'stations');

export let requestHandlers = {
  'stations': handleRequest
};

function handleRequest(request, response, path) {
  console.log('stations', path);
  if (path === 'update') {
    return updateStations()
      .then(() => server.writeJson(response, 'ok'));
  }
  throw server.createError(404, "Not found: '" + path + "'");
}

function updateStations() {
  let indexFile = join(stationsDir, 'index.json');
  return buildIndex()
    .then(index => writeFileAsync(indexFile, toJson(index)));
}

function buildIndex() {
  return getSubDirs(stationsDir)
    .map(subdir => getStationInfo(subdir));
}

function getStationInfo(subdir) {
  let indexFile = join(stationsDir, subdir, 'index.json');
  return ensureIsFile(indexFile)
    .then(() => readJsonFile(indexFile));
}
