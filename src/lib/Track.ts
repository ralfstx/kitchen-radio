import { normalize } from 'path';

/**
 * A single track.
 */
export class Track {

  private _path: string;
  private _artist: string;
  private _title: string;
  private _albumArtist: string;
  private _albumTitle: string;
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
    this._albumArtist = metadata.albumArtist || '';
    this._albumTitle = metadata.albumTitle || '';
    this._length = metadata.length && metadata.length > 0 ? Math.ceil(metadata.length) : 0;
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
   * the album artist
   */
  get albumArtist(): string {
    return this._albumArtist;
  }

  /**
   * the album title
   */
  get albumTitle(): string {
    return this._albumTitle;
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
  albumArtist?: string;
  albumTitle?: string;
  length?: number;
}
