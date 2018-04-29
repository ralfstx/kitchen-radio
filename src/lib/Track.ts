import { normalize } from 'path';

/**
 * A single track.
 */
export class Track {

  private _path: string;
  private _artist: string;
  private _title: string;
  private _length: number;

  /**
   * @param path the path to the audio file
   * @param metadata the metadata for this track
   */
  constructor(path: string, metadata: TrackMetadata = {}) {
    if (!path) {
      throw new Error('path missing');
    }
    this._path = normalize(path);
    this._artist = metadata.artist || '';
    this._title = metadata.title || '';
    this._length = metadata.length < 0 ? 0 : Math.ceil(metadata.length);
  }

  /**
   * the path to the audio file
   */
  get path(): string {
    return this._path;
  }

  /**
   * the track artist
   */
  get artist(): string {
    return this._artist;
  }

  /**
   * the track title
   */
  get title(): string {
    return this._title;
  }

  /**
   * the length of this track in seconds
   */
  get length(): number {
    return this._length || 0;
  }

}

interface TrackMetadata {
  artist?: string;
  title?: string;
  length?: number;
}
