import mpd from 'mpd';

import {readProps} from './util';
import config from './config';

let mpdClient;

connectMpd();

function connectMpd() {
  let params = {
    host: config.get('mpdHost') || 'localhost',
    port: config.get('mpdPort') || 6600
  };
  mpdClient = mpd.connect(params)
    .on('ready', () => console.log('Connected to mpd on ' + params.host + ', port ' + params.port))
    .on('error', (err) => { console.error('mpd error', err); })
    .on('system-playlist', () => { console.log('mpd playlist changed'); })
    .on('end', connectMpd);
}

function sendCommand(command) {
  return new Promise((resolve, reject) => {
    mpdClient.sendCommand(command, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function sendCommands(commands) {
  return new Promise((resolve, reject) => {
    mpdClient.sendCommands(commands, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export function status() {
  return sendCommand(mpd.cmd('status', []))
    .then(msg => readProps(msg));
}

export function playlist() {
  return sendCommand(mpd.cmd('playlistinfo', [])).then((msg) => {
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

export function play(url) {
  let cmds = ['play'];
  if (url) {
    let ext = url.substr(-4).toLowerCase();
    let isPlaylist = ext === '.m3u' || ext === '.pls' || ext === '.asx';
    cmds = ['clear', (isPlaylist ? 'load ' : 'add ') + url, 'play'];
  }
  return sendCommands(cmds);
}

export function replace(urls) {
  let cmds = ['clear'];
  urls.forEach((url) => {
    cmds.push('add "' + url + '"');
  });
  cmds.push('play');
  return sendCommands(cmds);
}

export function append(urls) {
  let cmds = [];
  urls.forEach((url) => {
    cmds.push('add "' + url + '"');
  });
  cmds.push('play');
  return sendCommands(cmds);
}

export function stop() {
  return sendCommand('stop');
}

export function pause() {
  return sendCommand('pause');
}

export function prev() {
  return sendCommand('previous');
}

export function next() {
  return sendCommand('next');
}
