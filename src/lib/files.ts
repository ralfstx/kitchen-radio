/*
 * Utility methods for files.
 */
import {stat, Stats} from 'fs-extra'; // eslint-disable-line no-unused-vars

/**
 * Obtains the stats for a given file but does not throw if the file is present or not accessible.
 *
 * @param {string} path the path to get stats for
 * @returns {Promise<Stats>} the stats of the file if available, `null` otherwise
 */
export async function statSafe(path) {
  try {
    return await stat(path);
  } catch (error) {
    return null;
  }
}
