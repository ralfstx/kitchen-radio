import Track from './Track';

/**
 * A list of tracks.
 */
export default class TrackList {

  /**
   * Creates a new track list.
   * @param {Iterable<Track>} tracks the tracks to include
   * @param {any} metadata the metadata for the track list
   */
  constructor(tracks, metadata = {}) {
    if (!tracks) {
      throw new Error('tracks missing');
    }
    this._tracks = Array.from(tracks);
    this._name = metadata.name || '';
  }

  /**
   * the name of the track list
   * @type {string}
   */
  get name() {
    return this._name;
  }

  /**
   * @type {Iterable<Track>}
   */
  get tracks() {
    return this._tracks.concat();
  }

}

Track.name; // eslint
