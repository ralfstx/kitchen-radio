/*
 * Utility methods for files.
 */
import {join} from 'path';
import {stat, readdir} from 'fs-extra';

export async function walk(path, fn, _base) {
  let base = _base || path;
  let relpath = _base ? path : '';
  let abspath = join(base, relpath);
  let stats = await stat(abspath);
  let recurse = await fn(relpath, stats);
  if (stats.isDirectory() && recurse) {
    let files = await readdir(abspath);
    for (let file of files) {
      await walk(join(relpath, file), fn, base);
    }
  }
}

export async function getSubDirs(dir) {
  let files = await readdirAsyncWrapped(dir);
  let result = [];
  for (let file of files) {
    let stats = await stat(join(dir, file));
    if (stats.isDirectory()) {
      result.push(file);
    }
  }
  return result;
}

function readdirAsyncWrapped(dir) {
  return readdir(dir).catch(err => {
    if (err.code === 'ENOTDIR' || err.code === 'ENOENT') {
      throw Object.assign(new Error(`Could not read directory: '${dir}'`), {cause: err});
    }
    throw err;
  });
}

export function statSafe(file) {
  return stat(file).catch(() => null);
}
