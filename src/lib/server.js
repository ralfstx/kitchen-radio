import {join, extname, normalize} from 'path';
import {createReadStream} from 'fs';
import {createServer} from 'http';
import {parse} from 'url';
import _ from 'underscore';

import config from './config';
import logger from './logger';
import {statAsyncSafe} from './files';

let mimetypes = {
  // text
  '.txt': 'text/plain; charset=UTF-8',
  '.html': 'text/html; charset=UTF-8',
  // image
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  // audio
  '.mp3': 'audio/mpeg',
  '.flac': 'audio/flac',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  // binary
  '.json': 'application/json; charset=UTF-8',
  '.js': 'application/javascript',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
  // other
  other: 'application/octet-stream'
};

function getMimeType(filename) {
  return Promise.resolve(mimetypes[extname(filename)] || mimetypes.other);
}

let handlers = {};
let server;

export function start() {
  return new Promise(resolve => {
    if (server) {
      resolve(false);
    } else {
      let port = config.get('port');
      server = createServer(handleRequest);
      server.listen(port, () => {
        resolve(true);
        logger.info('Server started on port %d', port);
      });
    }
  });
}

export function stop() {
  return new Promise(resolve => {
    if (server) {
      server.close(() => {
        server = null;
        resolve(true);
        logger.info('Server stopped');
      });
    } else {
      resolve(false);
    }
  });
}

export function clearHandlers() {
  handlers = {};
}

export function addHandlers(handlers) {
  if (_.isObject(handlers)) {
    for (let path in handlers) {
      addHandler(path, handlers[path]);
    }
  }
}

function addHandler(prefix, handler) {
  let old = handlers[prefix];
  handlers[prefix] = handler;
  return old;
}

function handleRequest(request, response) {
  return Promise.resolve().then(() => {
    let urlpath = getUrlPath(request);
    logger.debug('request %s', urlpath);
    let parts = splitPath(urlpath);
    if (parts[0] in handlers) {
      return handlers[parts[0]](request, response, parts[1]);
    }
    if ('' in handlers) {
      return handlers[''](request, response, urlpath);
    }
    throw createError(404, 'Not Found: ' + urlpath);
  }).catch((err) => {
    if (err.httpCode && err.httpCode < 500) {
      logger.debug('HTTP ' + err.httpCode, err.message || err, request.url);
    } else {
      logger.error('HTTP ' + (err.httpCode || 500), err.stack || err.message || err);
    }
    writeJson(response, {error: err.message}, err.httpCode || 500);
  });
}

function getUrlPath(request) {
  return decodeURIComponent(parse(request.url).pathname).substr(1);
}

function splitPath(path) {
  let start = (path.substr(0, 1) === '/') ? 1 : 0;
  let index = path.indexOf('/', start);
  let head = path.substr(start, index === -1 ? path.length : index);
  let tail = index === -1 ? '' : path.substr(index + 1, path.length);
  return [head, tail];
}

export function readBody(request) {
  return new Promise(function(resolve, reject) {
    let body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      resolve(body);
    });
    request.on('error', function (err) {
      reject(err);
    });
  });
}

export function writeFile(response, filepath) {
  let realpath = normalize(filepath);
  if (realpath.indexOf('../') !== -1) {
    throw new Error("Illegal path '" + filepath + "'");
  }
  return statAsyncSafe(realpath).then(function(stats) {
    if (!stats) {
      throw createError(404, "Not Found: '" + filepath + "'");
    } else if (!stats.isFile()) {
      throw createError(403, "Not a File: '" + filepath + "'");
    } else {
      return writeExistingFile(response, realpath);
    }
  });
}

export function createFileHandler(dir, options) {
  return function(request, response, path) {
    let realPath = normalize(join(dir, path));
    if (realPath.split('/').indexOf('..') !== -1) {
      throw createError(403, 'Illegal path: ' + path);
    }
    return statAsyncSafe(realPath).then(function(stats) {
      if (stats && stats.isFile()) {
        return writeExistingFile(response, realPath);
      }
      if (stats && stats.isDirectory()) {
        if (options && 'index' in options) {
          let indexPath = join(realPath, options.index);
          return statAsyncSafe(indexPath).then(function(stats) {
            if (stats && stats.isFile()) {
              return writeExistingFile(response, indexPath);
            }
            throw createError(403, 'Forbidden: ' + path);
          });
        }
        throw createError(403, 'Forbidden: ' + path);
      }
      throw createError(404, 'Not Found: ' + path);
    });
  };
}

function writeExistingFile(response, path) {
  return getMimeType(path).then(function(mimeType) {
    response.setHeader('Content-Type', mimeType);
  }).then(function() {
    // omit Content-Length header to enable chunked transfer encoding
    // response.setHeader("Content-Length": stats.size);
    let stream = createReadStream(path);
    return new Promise(function(resolve, reject) {
      stream.on('end', resolve).on('error', reject);
      stream.pipe(response);
    }).catch(function(err) {
      if (err.code && err.code === 'EACCES') {
        throw createError(403, 'Forbidden');
      }
      throw err;
    });
  });
}

export function writeJson(response, data, httpCode) {
  response.statusCode = httpCode || 200;
  response.setHeader('Content-Type', 'application/json; charset: utf-8');
  response.end(JSON.stringify(data, null, ' '));
}

export function createError(httpCode, message) {
  let error = new Error(message);
  error.httpCode = httpCode;
  return error;
}
