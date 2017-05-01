/*
 * Utility methods for files.
 */
import {stat} from 'fs-extra';

export async function statSafe(file) {
  return await stat(file).catch(() => null);
}
