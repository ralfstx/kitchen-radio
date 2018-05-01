import { Track } from './Track';
import { TrackList } from './TrackList';
import { pick } from './util';

const META_DATA_KEYS = ['name', 'artist', 'title'];

/**
 * A collection of tracks, organized in parts. Each track is included in a disc.
 */
export class Album {

  private _discs: TrackList[];
  private _metadata: {[key: string]: any};

  /**
   * @param discs the parts of this album
   * @param metadata the metadata of this album
   */
  constructor(discs: TrackList[] = [], metadata: any = {}) {
    this._discs = discs;
    this._metadata = pick(metadata, META_DATA_KEYS);
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

}
