import { readdir, readJson } from 'fs-extra';
import { basename, extname, join } from 'path';
import { AudioFileMetadata, Metadata } from '../lib/Metadata';
import { Album } from './Album';
import { AlbumDB } from './AlbumDB';
import { readAlbumFromIndex } from './AlbumIndex';
import { statSafe } from './files';
import { Logger } from './Logger';
import { Track } from './Track';
import { TrackList } from './TrackList';

export class AlbumFinder {
  private _logger: Logger;
  private _albumDB: AlbumDB;
  private _baseDir: string | undefined;

  constructor(context: {logger: Logger, albumDB: AlbumDB}) {
    this._logger = context.logger;
    this._albumDB = context.albumDB;
  }

  public async find(baseDir: string): Promise<void> {
    if (this._baseDir) throw new Error('instance already in use');
    this._baseDir = baseDir;
    await this._processDir('');
  }

  private async _processDir(path: string): Promise<void> {
    let dir = join(this._baseDir!, path);
    let stats = await statSafe(dir);
    if (!stats || !stats.isDirectory()) return;
    if (this._isExcluded(path)) return;
    if (await this._hasIndex(dir)) {
      await this._loadAlbumFromIndex(path);
    } else {
      let trackList = await this._findTracks(path);
      if (trackList) {
        let album = this._createAlbumFromTrackList(trackList);
        await this._albumDB.addAlbum(album, path);
      }
      for (let file of await this._readdirSafe(dir)) {
        await this._processDir(join(path, file));
      }
    }
  }

  private async _hasIndex(dir: string) {
    let stats = await statSafe(join(dir, 'index.json'));
    return !!stats && stats.isFile();
  }

  private async _loadAlbumFromIndex(path: string): Promise<void> {
    let dir = join(this._baseDir!, path);
    let indexFile = join(dir, 'index.json');
    let data = await this._readJsonSafe(indexFile);
    if (!data) return;
    if (!data.name) {
      this._logger.warn(`Album name missing in '${dir}'`);
      return;
    }
    let album = readAlbumFromIndex(path, data);
    await this._albumDB.addAlbum(album, path);
  }

  private _createAlbumFromTrackList(trackList: TrackList): Album {
    let albumTitles = trackList.tracks.map(track => track.albumTitle);
    let commonAlbumTitle = allSame(albumTitles) ? albumTitles[0] : '';
    let name = commonAlbumTitle || 'Unknown Album';
    if (albumTitles.length && albumTitles[0] && allSame(albumTitles)) {
      name = albumTitles[0];
    }
    return new Album([trackList], {name});
  }

  private async _findTracks(path: string): Promise<TrackList | null> {
    let dir = join(this._baseDir!, path);
    let tracks = [];
    for (let name of await this._readdirSafe(dir)) {
      let file = join(dir, name);
      let stats = await statSafe(file);
      if (stats && stats.isFile() && this._isSupportedFile(file)) {
        let metadata = await this._readMetadataSafe(file);
        tracks.push(new Track(join(path, name), metadata));
      }
    }
    return tracks.length ? new TrackList(tracks) : null;
  }

  private async _readMetadataSafe(file: string): Promise<AudioFileMetadata> {
    try {
      return await Metadata.getTrackMetadata(file);
    } catch (err) {
      this._logger.warn(`Failed to get metadata for ${file}`, {err});
      return {};
    }
  }

  private _isSupportedFile(path: string): boolean {
    return ['.mp3', '.ogg', '.flac'].includes(extname(path));
  }

  private _isExcluded(path: string): boolean {
    return basename(path).startsWith('.') || path.endsWith('~');
  }

  private async _readdirSafe(dir: string): Promise<string[]> {
    try {
      return await readdir(dir);
    } catch (err) {
      this._logger.warn(`Could not read dir '${dir}'`, {err});
      return [];
    }
  }

  private async _readJsonSafe(file: string): Promise<any> {
    try {
      return await readJson(file);
    } catch (err) {
      this._logger.warn(`Could not read JSON file '${file}'`, {err});
      return null;
    }
  }

}

function allSame(strings: string[]): boolean {
  for (let i = 1; i < strings.length; i++) {
    if (strings[i] !== strings[i - 1]) {
      return false;
    }
  }
  return true;
}
