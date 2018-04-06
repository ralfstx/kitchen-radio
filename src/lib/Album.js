import {pick} from './util';
import {Track} from './Track'; // eslint-disable-line no-unused-vars
import {TrackList} from './TrackList'; // eslint-disable-line no-unused-vars

const META_DATA_KEYS = ['name', 'artist', 'title'];

/**
 * A collection of tracks, organized in parts. Each track is included in a disc.
 */
export class Album {

  /**
   * @param {string} id a string to identify the album
   * @param {TrackList[]} discs the parts of this album
   * @param {any} metadata the metadata of this album
   */
  constructor(id, discs = [], metadata = {}) {
    this._discs = discs;
    this._metadata = pick(metadata, META_DATA_KEYS);
    this._id = id;
  }

  /**
   * @type {string} a string to identify the album
   */
  get id() {
    return this._id;
  }

  /**
   * @type {string} the album artist
   */
  get artist() {
    return this._metadata.artist || '';
  }

  /**
   * @type {string} the album title
   */
  get title() {
    return this._metadata.title || '';
  }

  /**
   * @type {string} a short name, including artist and album title
   */
  get name() {
    return this._metadata.name || [this.artist, this.title].filter(s => !!s).join(' - ');
  }

  /**
   * @type {TrackList[]} a list of the parts of this album
   */
  get discs() {
    return this._discs.concat();
  }

  /**
   * @type {Track[]} a list of all tracks in this album
   */
  get tracks() {
    return this._discs.reduce((prev, curr) => prev.concat(curr.tracks), []);
  }

}
