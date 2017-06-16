import {parse as parseUrl} from 'url';
import mpd from 'mpd';
import fetch from 'node-fetch';
import {isPlaylist, readFiles} from './Playlist';
import {readProps} from './util';

export default class Player {

  constructor(context) {
    this.logger = context.logger;
    this._port = context.port;
    this._mpdPort = context.mpdPort;
    this._mpdHost = context.mpdHost;
    this._albumDb = context.albumDB;
  }

  async connectMpd() {
    return new Promise((resolve, reject) => {
      let host = this._mpdHost, port = this._mpdPort;
      this._mpdClient = mpd.connect({host, port})
        .on('ready', () => {
          this.logger.info(`Connected to mpd on ${host}, port ${port}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error('mpd error', err);
          reject(err);
        })
        .on('end', () => {
          this.logger.error('mpd disconnected');
        })
        .on('system-player', () => this._notifyStatusChange())
        .on('system-playlist', () => this._notifyStatusChange());
    });
  }

  async play(pos = 0) {
    return await this._sendCommand('play ' + pos);
  }

  async stop() {
    return await this._sendCommand('stop');
  }

  async pause() {
    return await this._sendCommand('pause');
  }

  async prev() {
    return await this._sendCommand('previous');
  }

  async next() {
    return await this._sendCommand('next');
  }

  // STATUS REQUESTS

  async status() {
    let res = await this._sendCommand('status');
    return readProps(res);
  }

  async playlist() {
    let res = await this._sendCommand('playlistinfo');
    return this._extractPlaylist(res);
  }

  // PLAYLIST MODIFICATION

  async append(urls) {
    // TODO keep track of changes to playlist
    let playCommands = await this._toCommands(urls);
    await this._sendCommands([...playCommands, 'play']);
  }

  async replace(urls) {
    // TODO keep track of changes to playlist
    let playCommands = await this._toCommands(urls);
    await this._sendCommands(['clear', ...playCommands, 'play']);
  }

  async remove(index) {
    await this._sendCommand('delete ' + index);
  }

  _notifyStatusChange() {
    this.logger.info('mpd status changed');
    this._sendCommand('status')
      .then(readProps)
      .then(status => this._notify('onStatusChange', status))
      .catch(() => {}); // MPD error logged in _sendCommand
  }

  _notify(name, event) {
    if (name in this) {
      this[name](event);
    }
  }

  async _sendCommand(command) {
    return new Promise((resolve, reject) => {
      this._mpdClient.sendCommand(command, (err, result) => {
        if (err) {
          this.logger.error(`Failed to send mpd command '${command}'`, err);
          reject(new Error('Command failed'));
        } else {
          this.logger.debug(`Sent mpd command '${command}'`);
          resolve(result);
        }
      });
    });
  }

  async _sendCommands(commands) {
    return new Promise((resolve, reject) => {
      this._mpdClient.sendCommands(commands, (err, result) => {
        let commandsStr = commands.map(command => `'${command}'`).join(', ');
        if (err) {
          this.logger.error(`Failed to send mpd commands ${commandsStr}`, err);
          reject(new Error('Command failed'));
        } else {
          this.logger.debug(`Sent mpd commands ${commandsStr}`);
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

  async _toCommands(urls) {
    let commands = [];
    for (let url of urls) {
      if (url.startsWith('/')) {
        url = 'http://localhost:' + this._port + url;
      }
      if (isPlaylist(url)) {
        let content = await getText(url);
        let tracks = readFiles(content);
        tracks.forEach(track => commands.push('add "' + track + '"'));
      } else {
        commands.push('add "' + url + '"');
      }
    }
    return commands;
  }

}

async function getText(url) {
  let response = await fetch(url);
  return await response.text();
}
