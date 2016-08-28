import {join} from 'path';
import Promise from 'bluebird';
import _ from 'underscore';

import config from './lib/config';
import logger from './lib/logger';
import {toJson} from './lib/util';
import {getSubDirs, ensureIsFile, readJsonFile, statAsyncSafe, writeFileAsync} from './lib/files';
import {resizeImage} from './lib/images';
import {writeJson, createError} from './lib/server';

const albumsDir = join(config.get('musicDir'), 'albums');

export let requestHandlers = {
  'albums': handleRequest
};

export function updateIndex() {
  let indexFile = join(albumsDir, 'index.json');
  return buildIndex().then(index => writeFileAsync(indexFile, toJson(index)));
}

function handleRequest(request, response, path) {
  if (path === 'update') {
    return updateIndex()
      .then(() => writeJson(response, 'ok'));
  }
  if (path === 'update-images') {
    return updateImages()
      .then(results => writeJson(response, _.extend({status: 'ok'}, results)));
  }
  throw createError(404, "Not found: '" + path + "'");
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
