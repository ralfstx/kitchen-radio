import {join, normalize} from 'path';
import {pick} from './util';
import {Album} from './Album';
import {Track} from './Track';
import {TrackList} from './TrackList';

/** The metadata keys to copy */
const META_DATA_KEYS = ['name', 'artist', 'title', 'album', 'albumartist', 'length'];

export function createAlbumFromIndex(path, metadata) {
  let dir = normalize(path);
  let discs = [];
  if (metadata.tracks && metadata.tracks.length) {
    let tracks = metadata.tracks.map(track => new Track(join(dir, track.path), track));
    discs.push(new TrackList(tracks));
  }
  if (metadata.discs) {
    metadata.discs.forEach(disc => {
      if (disc.tracks && disc.tracks.length) {
        let tracks = disc.tracks.map(track => new Track(join(dir, disc.path, track.path), track));
        discs.push(new TrackList(tracks, disc));
      }
    });
  }
  return new Album(discs, pick(metadata, META_DATA_KEYS));
}
