import {parse as parseUrl} from 'url';
import mpd from 'mpd';
import {readProps} from './util';

export default class Player {

  constructor(context) {
    this.logger = context.get('logger');
    this._port = context.get('port');
    this._mpdPort = context.get('mpdPort');
    this._mpdHost = context.get('mpdHost');
    this._albumDb = context.get('instance:AlbumDB');
  }

  connectMpd() {
    let host = this._mpdHost, port = this._mpdPort;
    this._mpdClient = mpd.connect({host, port})
      .on('ready', () => this.logger.info(`Connected to mpd on ${host}, port ${port}`))
      .on('error', (err) => this.logger.error('mpd error', err))
      .on('system-playlist', () => this.logger.info('mpd playlist changed'))
      .on('end', () => setTimeout(() => this.connectMpd(), 2000));
  }

  play() {
    return this._sendCommand('play').then(() => null);
  }

  stop() {
    return this._sendCommand('stop').then(() => null);
  }

  pause() {
    return this._sendCommand('pause').then(() => null);
  }

  prev() {
    return this._sendCommand('previous').then(() => null);
  }

  next() {
    return this._sendCommand('next').then(() => null);
  }

  status() {
    return this._sendCommand('status').then(readProps);
  }

  playlist() {
    return this._sendCommand('playlistinfo').then(res => this._extractPlaylist(res));
  }

  append(urls) {
    // TODO keep track of changes to playlist
    return this._sendCommands([...this._toCommands(urls), 'play']).then(() => null);
  }

  replace(urls) {
    // TODO keep track of changes to playlist
    return this._sendCommands(['clear', ...this._toCommands(urls), 'play']).then(() => null);
  }

  _sendCommand(command) {
    return new Promise((resolve, reject) => {
      this._mpdClient.sendCommand(command, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  _sendCommands(commands) {
    return new Promise((resolve, reject) => {
      this._mpdClient.sendCommands(commands, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  _extractPlaylist(msg) {
    let playlist = [];
    let entry = {};
    readProps(msg, (key, value) => {
      if (key === 'file') {
        entry = {};
        playlist.push(entry);
      }
      entry[key] = value;
    });
    return playlist.map(item => this._processPlaylistEntry(item));
  }

  _processPlaylistEntry(item) {
    let url = parseUrl(item.file);
    if (url.hostname === 'localhost') {
      let info = this._extractTrackInfo(url.pathname);
      if (info) {
        let track = this._findTrack(info);
        if (track) {
          return {
            file: url.pathname,
            album: info.album,
            disc: info.disc,
            track: info.track,
            name: track.title,
            time: track.length
          };
        }
      }
    }
    return {
      file: item.file,
      name: item.Name || item.Title || '?',
      time: item.Time
    };
  }

  _extractTrackInfo(path) {
    let parts = path.split('/').filter(part => part.length);
    if (parts[0] === 'albums') {
      let album = parts[1];
      if (parts[2] === 'tracks') {
        return {album, disc: 1, track: parseInt(parts[3])};
      } else if (parts[2] === 'discs' && parts[4] === 'tracks') {
        return {album, disc: parseInt(parts[3]), track: parseInt(parts[5])};
      }
    }
  }

  _findTrack(info) {
    let album = this._albumDb.getAlbum(info.album);
    if (!album) return;
    let disc = album.discs[info.disc - 1];
    if (!disc) return;
    let track = disc.tracks[info.track - 1];
    if (!track) return;
    return track;
  }

  _toCommands(urls) {
    return urls
      .map(url => url.startsWith('/') ? 'http://localhost:' + this._port + url : url)
      .map(url => (isPlaylist(url) ? 'load "' : 'add "') + url + '"');
  }

}

function isPlaylist(url) {
  let ext = url.substr(-4).toLowerCase();
  return ext === '.m3u' || ext === '.pls' || ext === '.asx';
}
