/*
 * Utility methods for files.
 */

let Promise = require('bluebird');
let Fs = Promise.promisifyAll(require('fs'));
let Path = require('path');

exports.callRecursive = callRecursive;
exports.ensureIsFile = ensureIsFile;
exports.ensureIsDir = ensureIsDir;
exports.getSubDirs = getSubDirs;
exports.statAsyncSafe = statAsyncSafe;
exports.readJsonFile = readJsonFile;

function callRecursive(path, fn) {
  return Fs.statAsync(path).then((stats) => {
    return Promise.resolve(fn(path, stats)).then(() => {
      if (stats.isDirectory()) {
        return Fs.readdirAsync(path).each(file => callRecursive(Path.join(path, file), fn));
      }
    });
  });
}

function ensureIsFile(file) {
  return statAsyncSafe(file).then((stats) => {
    if (!stats) {
      throw new Error("No such file: '" + file + "'");
    } else if (!stats.isFile()) {
      throw new Error('Not a file: ' + file + "'");
    }
  });
}

function ensureIsDir(dir) {
  return statAsyncSafe(dir).then((stats) => {
    if (!stats) {
      throw new Error("No such directory: '" + dir + "'");
    } else if (!stats.isDirectory()) {
      throw new Error('Not a directory: ' + dir + "'");
    }
  });
}

function getSubDirs(dir) {
  return Fs.readdirAsync(dir)
    .filter(file => Fs.statAsync(Path.join(dir, file))
      .then(stats => stats.isDirectory()))
    .catch(() => {
      throw new Error("Could not read directory: '" + dir + "'");
    });
}

function statAsyncSafe(file) {
  return Fs.statAsync(file).catch(() => null);
}

function readJsonFile(file) {
  return Fs.readFileAsync(file, {encoding: 'utf8'})
    .then(data => JSON.parse(data))
    .catch((err) => {
      throw new Error("Could not read JSON file '" + file + "': " + err.message);
    });
}
