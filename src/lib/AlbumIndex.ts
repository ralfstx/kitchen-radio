import {join, normalize} from 'path';
import {pick} from './util';
import {Album} from './Album';
import {Track} from './Track';
import {TrackList} from './TrackList';

/** The metadata keys to copy */
const META_DATA_KEYS = ['name', 'artist', 'title', 'tags'];

export function createAlbumFromIndex(path, index) {
  let dir = normalize(path);
  let discs = [];
  if (index.tracks && index.tracks.length) {
    let tracks = index.tracks.map(track => new Track(join(dir, track.path), track));
    discs.push(new TrackList(tracks));
  }
  if (index.discs) {
    index.discs.forEach(disc => {
      if (disc.tracks && disc.tracks.length) {
        let tracks = disc.tracks.map(track => new Track(join(dir, disc.path || '.', track.path), track));
        discs.push(new TrackList(tracks, disc));
      }
    });
  }
  return new Album(discs, pick(index, META_DATA_KEYS));
}
