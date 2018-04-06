/*
 * Types to represent albums and tracks
 */
import {join, normalize} from 'path';

/** The metadata keys to copy */
const META_DATA_KEYS = ['name', 'artist', 'title', 'album', 'albumartist', 'length', 'mbid', 'dcid'];

/** The fields to include in the index file and their order */
const ALBUM_INDEX_KEYS = ['path', 'name', 'artist', 'title', 'year', 'length', 'mbid', 'dcid',
  'wikipedia', 'discs', 'tracks'];

export class Track {

  constructor(parent, path) {
    if (!path) {
      throw new Error('path missing');
    }
    this._path = path;
    this._metadata = {};
    if (parent && !(parent instanceof TrackList)) {
      throw new TypeError('parent must be a TrackList');
    }
    this._parent = parent;
    if (this._parent) {
      this._parent._tracks.push(this);
    }
  }

  get metadata() {
    return this._metadata;
  }

  set metadata(metadata) {
    this._metadata = filterMetaData(metadata);
  }

  get number() {
    return this._parent ? this._parent.tracks.indexOf(this) + 1 : 0;
  }

  get album() {
    return this._parent ? this._parent.album : null;
  }

  get artist() {
    if (this._metadata.artist) {
      return this._metadata.artist;
    }
    let album = this.album;
    return album ? album.artist : null;
  }

  set artist(artist) {
    this._metadata.artist = artist;
  }

  get title() {
    return this._metadata.title || null;
  }

  set title(title) {
    this._metadata.title = title;
  }

  get length() {
    return this._metadata.length || 0;
  }

  set length(length) {
    this._metadata.length = length;
  }

  get path() {
    return this._path;
  }

  set path(path) {
    this._path = path;
  }

  get location() {
    return this._parent ? join(this._parent.location, this._path) : this._path;
  }

  get mbid() {
    return this._metadata.mbid;
  }

  set mbid(id) {
    this._metadata.mbid = id;
  }

  tags() {
    let tags = {};
    let album = this.album;
    let albumTitle = album ? album.title : null;
    if (albumTitle) {
      tags.album = albumTitle;
    }
    let artist = this.artist;
    let albumArtist = album ? album.artist : null;
    if (artist) {
      tags.artist = artist;
      if (albumArtist && albumArtist !== artist) {
        tags.albumartist = albumArtist;
      }
    }
    if (this._metadata.title) {
      tags.title = this._metadata.title;
    }
    if (this._metadata.length) {
      tags.length = this._metadata.length;
    }
    if (this._parent && this._parent._tracks.length > 1) {
      tags.totaltracks = this._parent._tracks.length;
      tags.tracknumber = this._parent._tracks.indexOf(this) + 1;
    }
    if (album && album._discs.length > 1) {
      tags.totaldiscs = album._discs.length;
      tags.discnumber = album._discs.indexOf(this._parent) + 1;
    }
    return tags;
  }

  toJSON() {
    return Object.assign({}, this._metadata, {
      path: this._path
    });
  }

}

export class TrackList {

  constructor(parent, path) {
    if (!path) {
      throw new Error('path missing');
    }
    this._path = path;
    this._parent = parent;
    this._metadata = {};
    this._tracks = [];
    let album = this.album;
    if (album) {
      album._discs.push(this);
    }
  }

  get metadata() {
    return this._metadata;
  }

  set metadata(metadata) {
    this._metadata = filterMetaData(metadata);
  }

  get album() {
    return this._parent ? this._parent.album : null;
  }

  get name() {
    return this._metadata.name || this._path;
  }

  get tracks() {
    return this._tracks.concat();
  }

  get path() {
    return this._path;
  }

  set path(path) {
    this._path = path;
  }

  get location() {
    return this._parent ? join(this._parent.location, this._path) : this._path;
  }

  toJSON() {
    return Object.assign({}, this._metadata, {
      path: this._path,
      tracks: this._tracks.map(track => track.toJSON())
    });
  }
}

export class Album {

  static fromJson(path, metadata) {
    let album = new Album(path);
    album._metadata = filterMetaData(metadata);
    if (metadata.tracks && metadata.tracks.length) {
      let disc = new TrackList(album, '.');
      metadata.tracks.forEach(trackData => {
        let track = new Track(disc, trackData.path);
        track.metadata = trackData;
      });
    }
    if (metadata.discs) {
      metadata.discs.forEach(discData => {
        let disc = new TrackList(album, discData.path);
        disc.metadata = discData;
        if (discData.tracks && discData.tracks.length) {
          discData.tracks.forEach(track => new Track(disc, track.path).metadata = track);
        }
      });
    }
    return album;
  }

  constructor(path) {
    if (!path) {
      throw new Error('path missing');
    }
    this._path = normalize(path);
    this._discs = [];
    this._metadata = {};
  }

  get metadata() {
    return this._metadata;
  }

  set metadata(metadata) {
    this._metadata = filterMetaData(metadata);
  }

  get album() {
    return this;
  }

  get name() {
    return this._metadata.name || [this.artist, this.title].filter(s => !!s).join(' - ') || this.path;
  }

  set name(name) {
    this._metadata.name = name;
  }

  get path() {
    return this._path;
  }

  get location() {
    return this._path;
  }

  get artist() {
    return this._metadata.artist || null;
  }

  set artist(artist) {
    this._metadata.artist  = artist;
  }

  get title() {
    return this._metadata.title || null;
  }

  set title(title) {
    this._metadata.title = title;
  }

  get discs() {
    return this._discs.concat();
  }

  get tracks() {
    return this._discs.reduce((prev, curr) => prev.concat(curr.tracks), []);
  }

  get dcid() {
    return this._metadata.dcid;
  }

  set dcid(id) {
    this._metadata.dcid = id;
  }

  get mbid() {
    return this._metadata.mbid;
  }

  set mbid(id) {
    this._metadata.mbid = id;
  }

  toJson() {
    return JSON.stringify(this, ALBUM_INDEX_KEYS, ' ') + '\n';
  }

  toJSON() {
    let data = Object.assign({}, this._metadata, {
      id: this.id,
      name: this.name,
      discs: this._discs.map(disc => disc.toJSON())
    });
    let sameArtist = this.tracks.every(track => track.artist === this.artist);
    if (sameArtist) {
      data.discs.forEach(disc => disc.tracks.forEach(track => delete track.artist));
    }
    return data;
  }

}

function filterMetaData(metadata) {
  let res = {};
  for (let key of META_DATA_KEYS) {
    if (key in metadata) {
      res[key] = metadata[key];
    }
  }
  return res;
}
