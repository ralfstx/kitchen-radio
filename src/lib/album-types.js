/*
 * Types to represent albums and tracks
 */
import {join, normalize} from 'path';

const DATA_KEYS = {
  name: true,
  artist: true,
  title: true,
  length: true,
  mbid: true
};

// defines the fields to include in the index and their order
const ALBUM_INDEX_KEYS = ['path', 'name', 'artist', 'title', 'year', 'length', 'mbid', 'discs', 'tracks'];

export class Track {

  constructor(parent, path) {
    if (!path) {
      throw new Error('path missing');
    }
    this._path = path;
    this._data = {};
    if (parent && !(parent instanceof TrackList)) {
      throw new TypeError('parent must be a TrackList');
    }
    this._parent = parent;
    if (this._parent) {
      this._parent._tracks.push(this);
    }
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = filterData(data);
  }

  get number() {
    return this._parent ? this._parent.tracks.indexOf(this) + 1 : 0;
  }

  get album() {
    return this._parent ? this._parent.album : null;
  }

  get artist() {
    if (this._data.artist) {
      return this._data.artist;
    }
    let album = this.album;
    return album ? album.artist : null;
  }

  get title() {
    return this._data.title || null;
  }

  get length() {
    return this._data.length || 0;
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
    if (this._data.title) {
      tags.title = this._data.title;
    }
    if (this._data.length) {
      tags.length = this._data.length;
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

  _toJsonObj() {
    return Object.assign({}, this._data, {
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
    this._data = {};
    this._tracks = [];
    let album = this.album;
    if (album) {
      album._discs.push(this);
    }
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = filterData(data);
  }

  get album() {
    return this._parent ? this._parent.album : null;
  }

  get name() {
    return this._data.name || this._path;
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

  _toJsonObj() {
    return Object.assign({}, this._data, {
      path: this._path,
      tracks: this._tracks.map(track => track._toJsonObj())
    });
  }
}

export class Album {

  static fromJson(path, data) {
    let album = new Album(path);
    album._data = filterData(data);
    if (data.tracks && data.tracks.length) {
      let disc = new TrackList(album, '.');
      data.tracks.forEach(trackData => {
        let track = new Track(disc, trackData.path);
        track.data = trackData;
      });
    }
    if (data.discs) {
      data.discs.forEach(discData => {
        let disc = new TrackList(album, discData.path);
        disc.data = discData;
        if (discData.tracks && discData.tracks.length) {
          discData.tracks.forEach(track => new Track(disc, track.path).data = track);
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
    this._data = {};
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = filterData(data);
  }

  get album() {
    return this;
  }

  get name() {
    return this._data.name;
  }

  get path() {
    return this._path;
  }

  get location() {
    return this._path;
  }

  get artist() {
    return this._data.artist || null;
  }

  get title() {
    return this._data.title || null;
  }

  get discs() {
    return this._discs.concat();
  }

  get tracks() {
    return this._discs.reduce((prev, curr) => prev.concat(curr.tracks), []);
  }

  toJson() {
    return JSON.stringify(this._toJsonObj(), ALBUM_INDEX_KEYS, ' ');
  }

  _toJsonObj() {
    return Object.assign({}, this._data, {
      discs: this._discs.map(disc => disc._toJsonObj())
    });
  }

}

function filterData(data) {
  let res = {};
  Object.keys(data).filter(key => DATA_KEYS[key]).forEach(key => {
    res[key] = data[key];
  });
  return res;
}
