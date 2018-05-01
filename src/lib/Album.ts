import { Track } from './Track';
import { TrackList } from './TrackList';
import { pick } from './util';

/**
 * A collection of tracks, organized in parts. Each track is included in a disc.
 */
export class Album {

  private _discs: TrackList[];
  private _metadata: AlbumMetadata;

  /**
   * @param discs the parts of this album
   * @param metadata the metadata of this album
   */
  constructor(discs: TrackList[] = [], metadata: AlbumMetadata = {}) {
    this._discs = discs;
    this._metadata = metadata;
  }

  /**
   * the album artist
   */
  get artist(): string {
    return this._metadata.artist || '';
  }

  /**
   * the album title
   */
  get title(): string {
    return this._metadata.title || '';
  }

  /**
   * a short name, including artist and album title
   */
  get name(): string {
    return this._metadata.name || [this.artist, this.title].filter(s => !!s).join(' - ');
  }

  /**
   * a list of the parts of this album
   */
  get discs(): TrackList[] {
    return this._discs.concat();
  }

  /**
   * a list of all tracks in this album
   */
  get tracks(): Track[] {
    return this._discs.reduce((prev, curr) => prev.concat(curr.tracks), []);
  }

  /**
   * a list of all tags attached to this album
   */
  get tags(): string[] {
    return this._metadata.tags || [];
  }

}

interface AlbumMetadata {
  name?: string;
  artist?: string;
  title?: string;
  tags?: string[];
}
