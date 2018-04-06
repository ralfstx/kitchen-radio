/*
 * Utility methods for files.
 */
import {stat} from 'fs-extra';

/**
 * Obtains the stats for a given file but does not throw if the file is present or not accessible.
 *
 * @param {string} file a file to stat
 * @returns {Promise<any>} the stats of the file if available, `null` otherwise
 */
export async function statSafe(file) {
  return await stat(file).catch(() => null);
}
