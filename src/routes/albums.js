import {Router} from 'express';
import {join} from 'path';
import Promise from 'bluebird';
import _ from 'underscore';

import config from '../lib/config';
import logger from '../lib/logger';
import {toJson} from '../lib/util';
import {getSubDirs, ensureIsFile, readJsonFile, statAsyncSafe, writeFileAsync} from '../lib/files';
import {resizeImage} from '../lib/images';

const albumsDir = join(config.get('musicDir'), 'albums');

export function router() {
  let router = Router();
  router.get('/update', (req, res) => {
    updateIndex().then(() => res.json('ok'));
  });
  router.get('/update-images', (req, res) => {
    updateImages().then(results => res.json(_.extend({status: 'ok'}, results)));
  });
  return router;
}

export function updateIndex() {
  let indexFile = join(albumsDir, 'index.json');
  return buildIndex().then(index => writeFileAsync(indexFile, toJson(index)));
}

function buildIndex() {
  return getSubDirs(albumsDir).map(subdir => getAlbumInfo(subdir));
}

function getAlbumInfo(subdir) {
  let indexFile = join(albumsDir, subdir, 'index.json');
  return ensureIsFile(indexFile).then(() => {
    return readJsonFile(indexFile).then(data => {
      if (!data.name) {
        logger.warn("Missing album name for '" + subdir + "'");
      }
      return {
        path: subdir,
        name: data.name
      };
    });
  });
}

export function updateImages(baseDir = albumsDir) {
  let log = {missing: [], written: []};
  return getSubDirs(baseDir)
    .each(subdir => updateAlbumImages(join(baseDir, subdir), log))
    .then(() => log);
}

function updateAlbumImages(albumDir, log) {
  let srcPath = join(albumDir, 'cover.jpg');
  return statAsyncSafe(srcPath).then(origStats => {
    if (!origStats) {
      logger.error('Missing cover image: ' + srcPath);
      log.missing.push(srcPath);
      return;
    }
    return Promise.resolve([100, 250]).map(size => {
      let dstPath = join(albumDir, 'cover-' + size + '.jpg');
      return statAsyncSafe(dstPath).then(stats => {
        if (!stats || (stats.mtime < origStats.mtime)) {
          logger.info('writing ' + dstPath);
          log.written.push(dstPath);
          return resizeImage(srcPath, dstPath, size);
        }
      });
    });
  });
}
