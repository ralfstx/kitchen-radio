let Promise = require('bluebird');
let Mpd = require('mpd');

let Util = require('./util');
let Config = require('./config');

let mpdClient;

connectMpd();

function connectMpd() {
  let config = {
    host: Config.get('mpdHost') || 'localhost',
    port: Config.get('mpdPort') || 6600
  };
  mpdClient = Mpd.connect(config)
    .on('ready', () => console.log('Connected to mpd on ' + config.host + ', port ' + config.port))
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

exports.status = function() {
  return sendCommand(Mpd.cmd('status', []))
    .then(msg => Util.readProps(msg));
};

exports.playlist = function() {
  return sendCommand(Mpd.cmd('playlistinfo', [])).then((msg) => {
    let playlist = [];
    let entry = {};
    Util.readProps(msg, (key, value) => {
      if (key === 'file') {
        entry = {};
        playlist.push(entry);
      }
      entry[key] = value;
    });
    return playlist;
  });
};

exports.play = function(url) {
  let cmds = ['play'];
  if (url) {
    let ext = url.substr(-4).toLowerCase();
    let isPlaylist = ext === '.m3u' || ext === '.pls' || ext === '.asx';
    cmds = ['clear', (isPlaylist ? 'load ' : 'add ') + url, 'play'];
  }
  return sendCommands(cmds);
};

exports.replace = function(urls) {
  let cmds = ['clear'];
  urls.forEach((url) => {
    cmds.push('add "' + url + '"');
  });
  cmds.push('play');
  return sendCommands(cmds);
};

exports.append = function(urls) {
  let cmds = [];
  urls.forEach((url) => {
    cmds.push('add "' + url + '"');
  });
  cmds.push('play');
  return sendCommands(cmds);
};

exports.stop = function() {
  return sendCommand('stop');
};

exports.pause = function() {
  return sendCommand('pause');
};

exports.prev = function() {
  return sendCommand('previous');
};

exports.next = function() {
  return sendCommand('next');
};
