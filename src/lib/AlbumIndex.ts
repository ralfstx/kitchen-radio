import { readJson, writeFile } from 'fs-extra';
import * as stringify from 'json-stable-stringify';
import { join, normalize, relative } from 'path';
import { Album } from './Album';
import { Track } from './Track';
import { TrackList } from './TrackList';
import { statSafe } from './files';
import { pick } from './util';

/** The metadata keys to copy */
const META_DATA_KEYS = ['name', 'artist', 'title', 'tags'];

/** The pre-defined order of serialized object keys */
const MEMBERS_ORDER = ['name', 'path', 'artist', 'title', 'tags', 'length', 'discs', 'tracks'];

export function readAlbumFromIndex(path: string, index: any): Album {
  let dir = normalize(path);
  let discs: TrackList[] = [];
  if (Array.isArray(index.tracks) && index.tracks.length) {
    let tracks = index.tracks.map((track: any) => new Track(join(dir, track.path), track));
    discs.push(new TrackList(tracks));
  }
  if (Array.isArray(index.discs)) {
    index.discs.forEach((disc: any) => {
      if (disc.tracks && disc.tracks.length) {
        let tracks = disc.tracks.map((track: any) => new Track(join(dir, disc.path || '.', track.path), track));
        discs.push(new TrackList(tracks, disc));
      }
    });
  }
  return new Album(discs, pick(index, META_DATA_KEYS));
}

export async function writeAlbumIndex(indexFile: string, album: Album, basePath: string) {
  let stats = await statSafe(indexFile);
  let hasIndex = !!stats && stats.isFile();
  let data = hasIndex ? await readJson(indexFile) : {};
  delete data.tracks;
  delete data.tags;
  let newData = {
    ...data,
    ...(album.tags.length ? {tags: album.tags} : {}),
    ...(album.title ? {title: album.title} : {}),
    ...(album.artist ? {artist: album.artist} : {}),
    name: album.name,
    discs: album.discs.map(serializeDisc)
  };
  let json = stringify(newData, {space: 1, cmp: compareMembers});
  await writeFile(indexFile, json, 'utf-8');

  function serializeDisc(disc: TrackList) {
    let {name, tracks} = disc;
    let result: any = {
      tracks: tracks.map(serializeTrack)
    };
    if (name) result.name = name;
    return result;
  }

  function serializeTrack(track: Track) {
    let {title, artist, albumTitle, albumArtist, length} = track;
    let path = relative(basePath, track.path);
    let result: any = {path, length};
    if (title) result.title = title;
    if (artist) result.artist = artist;
    if (albumTitle) result.albumTitle = albumTitle;
    if (albumArtist) result.albumArtist = albumArtist;
    return result;
  }
}

function compareMembers(a: {key: string}, b: {key: string}) {
  let ia = MEMBERS_ORDER.indexOf(a.key);
  let ib = MEMBERS_ORDER.indexOf(b.key);
  return (ia + ib < -1) ? a.key.localeCompare(b.key) : (ia >= 0 ? ia : 100) - (ib >= 0 ? ib : 100);
}
