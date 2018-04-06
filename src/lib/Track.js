import {join, basename, dirname} from 'path';

/**
 * A single track.
 */
export class Track {

  /**
   * @param {string} path the path to the audio file
   * @param {any} metadata the metadata for this track
   */
  constructor(path, metadata = {}) {
    if (!path) {
      throw new Error('path missing');
    }
    // keep path name separate to allow for string interning
    this._pathname = dirname(path);
    this._filename = basename(path);
    this._length = metadata.length < 0 ? 0 : Math.ceil(metadata.length);
    this._artist = metadata.artist || '';
    this._title = metadata.title || '';
  }

  /**
   * the path to the audio file
   * @type {string}
   */
  get path() {
    return join(this._pathname, this._filename);
  }

  /**
   * the length of this track in seconds
   * @type {number}
   */
  get length() {
    return this._length || 0;
  }

  /**
   * the track artist
   * @type {string}
   */
  get artist() {
    return this._artist;
  }

  /**
   * the track title
   * @type {string}
   */
  get title() {
    return this._title;
  }

}
