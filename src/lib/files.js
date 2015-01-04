/*
 * Utility methods for files.
 */

var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");

exports.callRecursive = callRecursive;
exports.ensureIsFile = ensureIsFile;
exports.ensureIsDir = ensureIsDir;
exports.getSubDirs = getSubDirs;
exports.statAsyncSafe = statAsyncSafe;
exports.readJsonFile = readJsonFile;

function callRecursive(path, fn) {
  return Fs.statAsync(path).then(function(stats) {
    return Promise.resolve(fn.call(this, path, stats)).then(function() {
      if (stats.isDirectory()) {
        return Fs.readdirAsync(path).each(function(file) {
          return callRecursive.call(this, Path.join(path, file), fn);
        });
      }
    });
  });
}

function ensureIsFile(file) {
  return statAsyncSafe(file).then(function(stats) {
    if (!stats) {
      throw new Error("No such file: '" + file + "'");
    } else if (!stats.isFile()) {
      throw new Error("Not a file: " + file + "'");
    }
  });
}

function ensureIsDir(dir) {
  return statAsyncSafe(dir).then(function(stats) {
    if (!stats) {
      throw new Error("No such directory: '" + dir + "'");
    } else if (!stats.isDirectory()) {
      throw new Error("Not a directory: " + dir + "'");
    }
  });
}

function getSubDirs(dir) {
  return Fs.readdirAsync(dir).filter(function(file) {
    return Fs.statAsync(Path.join(dir, file)).then(function(stats) {
      return stats.isDirectory();
    });
  }).catch(function() {
    throw new Error("Could not read directory: '" + dir + "'");
  });
}

function statAsyncSafe(file) {
  return Fs.statAsync(file).then(function(stats) {
    return stats;
  }).catch(function() {
    return null;
  });
}

function readJsonFile(file) {
  return Fs.readFileAsync(file, {encoding: "utf8"}).then(function(data) {
    return JSON.parse(data);
  }).catch(function(err) {
    throw new Error("Could not read JSON file '" + file + "': " + err.message);
  });
}
