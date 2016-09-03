import {Router} from 'express';
import {join} from 'path';

import config from '../lib/config';
import {toJson} from '../lib/util';
import {getSubDirs, ensureIsFile, readJsonFile, writeFileAsync} from '../lib/files';

let stationsDir = join(config.get('musicDir'), 'stations');

export function router() {
  let router = Router();
  router.get('/update', (req, res) => {
    updateStations().then(() => res.json('ok'));
  });
  return router;
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
