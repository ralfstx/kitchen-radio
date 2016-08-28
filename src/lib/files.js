/*
 * Utility methods for files.
 */
import {join} from 'path';
import {createReadStream, createWriteStream} from 'fs';
import _fs from 'fs';
import Promise from 'bluebird';

export let statAsync = Promise.promisify(_fs.stat);
export let readdirAsync = Promise.promisify(_fs.readdir);
export let readFileAsync = Promise.promisify(_fs.readFile);
export let writeFileAsync = Promise.promisify(_fs.writeFile);

export function callRecursive(path, fn) {
  return statAsync(path).then((stats) => {
    return Promise.resolve(fn(path, stats)).then(() => {
      if (stats.isDirectory()) {
        return readdirAsync(path).each(file => callRecursive(join(path, file), fn));
      }
    });
  });
}

export function ensureIsFile(file) {
  return statAsyncSafe(file).then((stats) => {
    if (!stats) {
      throw new Error(`No such file: '${file}'`);
    } else if (!stats.isFile()) {
      throw new Error(`Not a file: '${file}'`);
    }
  });
}

export function ensureIsDir(dir) {
  return statAsyncSafe(dir).then((stats) => {
    if (!stats) {
      throw new Error(`No such directory: '${dir}'`);
    } else if (!stats.isDirectory()) {
      throw new Error(`Not a directory: '${dir}'`);
    }
  });
}

export function getSubDirs(dir) {
  return readdirAsync(dir)
    .filter(file => statAsync(join(dir, file))
      .then(stats => stats.isDirectory()))
    .catch(() => {
      throw new Error(`Could not read directory: '${dir}'`);
    });
}

export function statAsyncSafe(file) {
  return statAsync(file).catch(() => null);
}

export function readJsonFile(file) {
  return readFileAsync(file, {encoding: 'utf8'})
    .then(data => JSON.parse(data))
    .catch((err) => {
      throw new Error(`Could not read JSON file '${file}': ${err.message}`);
    });
}

export function copy(srcPath, dstPath) {
  return new Promise((resolve, reject) => {
    let srcStream = createReadStream(srcPath).on('error', reject);
    let dstStream = createWriteStream(dstPath).on('error', reject).on('finish', resolve);
    srcStream.pipe(dstStream);
  });
}
