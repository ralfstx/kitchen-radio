/*
 * Utility methods for files.
 */
import {join} from 'path';
import {createReadStream, createWriteStream} from 'fs';
import _fs from 'fs';
import {promisify} from './util';

export let statAsync = promisify(_fs.stat);
export let readdirAsync = promisify(_fs.readdir);
export let readFileAsync = promisify(_fs.readFile);
export let writeFileAsync = promisify(_fs.writeFile);

export async function walk(path, fn, _base) {
  let base = _base || path;
  let relpath = _base ? path : '';
  let abspath = join(base, relpath);
  let stats = await statAsync(abspath);
  let recurse = await fn(relpath, stats);
  if (stats.isDirectory() && recurse) {
    let files = await readdirAsync(abspath);
    for (let file of files) {
      await walk(join(relpath, file), fn, base);
    }
  }
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

export async function getSubDirs(dir) {
  let files = await readdirAsyncWrapped(dir);
  let result = [];
  for (let file of files) {
    let stats = await statAsync(join(dir, file));
    if (stats.isDirectory()) {
      result.push(file);
    }
  }
  return result;
}

function readdirAsyncWrapped(dir) {
  return readdirAsync(dir).catch(err => {
    if (err.code === 'ENOTDIR' || err.code === 'ENOENT') {
      throw Object.assign(new Error(`Could not read directory: '${dir}'`), {cause: err});
    }
    throw err;
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
