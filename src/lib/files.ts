import { Stats, stat } from 'fs-extra';

/*
 * Utility methods for files.
 */

/**
 * Obtains the stats for a given file but does not throw if the file is present or not accessible.
 *
 * @param path the path to get stats for
 * @returns the stats of the file if available, `null` otherwise
 */
export async function statSafe(path: string): Promise<Stats> {
  try {
    return await stat(path);
  } catch (error) {
    return null;
  }
}
