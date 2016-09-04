import mpd from 'mpd';

import {readProps} from './util';
import logger from './logger';

export default class Player {

  connectMpd(host, port) {
    this._mpdClient = mpd.connect({host, port})
      .on('ready', () => logger.info(`Connected to mpd on ${host}, port ${port}`))
      .on('error', (err) => logger.error('mpd error', err))
      .on('system-playlist', () => logger.info('mpd playlist changed'))
      .on('end', () => this.connectMpd());
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
    return this._sendCommand('playlistinfo').then(extractPlaylist);
  }

  append(urls) {
    return this._sendCommands([...toCommands(urls), 'play']).then(() => null);
  }

  replace(urls) {
    return this._sendCommands(['clear', ...toCommands(urls), 'play']).then(() => null);
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

}

function toCommands(urls) {
  return urls.map(url => (isPlaylist(url) ? 'load "' : 'add "') + url + '"');
}

function isPlaylist(url) {
  let ext = url.substr(-4).toLowerCase();
  return ext === '.m3u' || ext === '.pls' || ext === '.asx';
}

function extractPlaylist(msg) {
  let playlist = [];
  let entry = {};
  readProps(msg, (key, value) => {
    if (key === 'file') {
      entry = {};
      playlist.push(entry);
    }
    entry[key] = value;
  });
  return playlist;
}
