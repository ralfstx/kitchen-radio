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

  status() {
    return this._sendCommand(mpd.cmd('status', []))
      .then(msg => readProps(msg));
  }

  playlist() {
    return this._sendCommand(mpd.cmd('playlistinfo', [])).then((msg) => {
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
    });
  }

  play(url) {
    let cmds = ['play'];
    if (url) {
      let ext = url.substr(-4).toLowerCase();
      let isPlaylist = ext === '.m3u' || ext === '.pls' || ext === '.asx';
      cmds = ['clear', (isPlaylist ? 'load ' : 'add ') + url, 'play'];
    }
    return this._sendCommands(cmds);
  }

  replace(urls) {
    let cmds = ['clear'];
    urls.forEach((url) => {
      cmds.push('add "' + url + '"');
    });
    cmds.push('play');
    return this._sendCommands(cmds);
  }

  append(urls) {
    let cmds = [];
    urls.forEach((url) => {
      cmds.push('add "' + url + '"');
    });
    cmds.push('play');
    return this._sendCommands(cmds);
  }

  stop() {
    return this._sendCommand('stop');
  }

  pause() {
    return this._sendCommand('pause');
  }

  prev() {
    return this._sendCommand('previous');
  }

  next() {
    return this._sendCommand('next');
  }

}
