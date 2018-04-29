import { Track } from './Track';

/**
 * A list of tracks.
 */
export class TrackList {

  private _tracks: Track[];
  private _name: any;

  /**
   * Creates a new track list.
   * @param tracks the tracks to include
   * @param metadata the metadata for the track list
   */
  constructor(tracks: Iterable<Track>, metadata: TrackListMetadata = {}) {
    if (!tracks) {
      throw new Error('tracks missing');
    }
    this._tracks = Array.from(tracks);
    this._name = metadata.name || '';
  }

  /**
   * the name of the track list
   */
  get name(): string {
    return this._name;
  }

  get tracks(): Track[] {
    return this._tracks.concat();
  }

}

interface TrackListMetadata {
  name?: string;
}
