import {join, basename, extname, relative} from 'path';
import {readJson, readdir} from 'fs-extra';
import {statSafe} from './files';
import {Album} from './Album'; // eslint-disable-line no-unused-vars
import {Context} from './Context'; // eslint-disable-line no-unused-vars
import {CoverDB} from './CoverDB'; // eslint-disable-line no-unused-vars
import {getTrackMetadata} from '../lib/metadata';
import {createAlbumFromIndex} from './AlbumIndex';
import {TrackList} from './TrackList';
import {Track} from './Track';

export class AlbumFinder {

  constructor(context) {
    this.logger = context.logger;
    this._albumDB = context.albumDB;
  }

  async find(baseDir) {
    if (this._baseDir) throw new Error('concurrent access');
    this._baseDir = baseDir;
    await this._processDir(baseDir);
    this._baseDir = null;
  }

  async _processDir(path) {
    let stats = await statSafe(path);
    if (!stats || !stats.isDirectory()) return;
    if (this._isExcluded(path)) return;
    if (await this._hasIndex(path)) {
      await this._loadAlbumFromIndex(path);
    } else {
      // TODO: Implement loading album from audio files
      // let trackList = await this._findTracks(path);
      // if (trackList) {
      //   let album = this._createAlbumFromTrackList(trackList);
      //   this._albumDB.addAlbum(album, path);
      // }
      for (let file of await this._readdirSafe(path)) {
        await this._processDir(join(path, file));
      }
    }
  }

  /**
   * Returns the index data if found, null otherwise
   * @param {string} folder
   * @returns {Promise<boolean>}
   */
  async _hasIndex(folder) {
    let stats = await statSafe(join(folder, 'index.json'));
    return !!stats && stats.isFile();
  }

  async _loadAlbumFromIndex(path) {
    let indexFile = join(path, 'index.json');
    let data = await this._readJsonSafe(indexFile);
    if (!data) return;
    if (!data.name) {
      this.logger.warn(`Album name missing in '${path}'`);
      return;
    }
    let album = createAlbumFromIndex(null, relative(this._baseDir, path), data);
    this._albumDB.addAlbum(album, path);
  }

  async _findTracks(path) {
    let tracks = [];
    for (let name of await this._readdirSafe(path)) {
      let file = join(path, name);
      let stats = await statSafe(file);
      if (stats && stats.isFile() && this._isSupportedFile(file)) {
        let metadata = await this._readMetadataSafe(file);
        tracks.push(new Track(file, metadata));
      }
    }
    return tracks.length ? new TrackList(tracks) : null;
  }

  async _readMetadataSafe(file) {
    try {
      return getTrackMetadata(file);
    } catch (err) {
      this.logger.warn(err);
      return {};
    }
  }

  _isSupportedFile(path) {
    return ['.mp3', '.ogg', '.flac'].includes(extname(path));
  }

  _isExcluded(path) {
    return basename(path).startsWith('.') || path.endsWith('~');
  }

  async _readdirSafe(dir) {
    try {
      return await readdir(dir);
    } catch (err) {
      this.logger.warn(`Could not read dir '${dir}'`);
      return [];
    }
  }

  async _readJsonSafe(file) {
    try {
      return await readJson(file);
    } catch (err) {
      this.logger.warn(`Could not read JSON file '${file}'`);
      return null;
    }
  }

}
