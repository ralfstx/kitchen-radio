import { Track } from './Track';
import { TrackList } from './TrackList';

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
    return this._discs.reduce((prev, curr) => prev.concat(curr.tracks), [] as Track[]);
  }

  /**
   * a list of all tags attached to this album
   */
  get tags(): string[] {
    return this._metadata.tags || [];
  }

  public addTags(tags: string[]) {
    if (!this._metadata.tags) {
      this._metadata.tags = [];
    }
    this._metadata.tags = this._metadata.tags.filter(tag => !tags.includes(tag));
    this._metadata.tags.push(...tags);
  }

  public removeTags(tags: string[]) {
    if (this._metadata.tags) {
      this._metadata.tags = this._metadata.tags.filter(tag => !tags.includes(tag));
    }
  }
}

interface AlbumMetadata {
  name?: string;
  artist?: string;
  title?: string;
  tags?: string[];
}
