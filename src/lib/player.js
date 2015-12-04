var Promise = require("bluebird");
var Mpd = require("mpd");

var Util = require("./util");
var Config = require("./config");

var mpdClient;

connectMpd();

function connectMpd() {
  var config = {
    host: Config.get("mpdHost") || "localhost",
    port: Config.get("mpdPort") || 6600
  };
  mpdClient = Mpd.connect(config).on("end", connectMpd);
}

function sendCommand(command) {
  return new Promise(function(resolve, reject) {
    mpdClient.sendCommand(command, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    });
  });
}

function sendCommands(commands) {
  return new Promise(function(resolve, reject) {
    mpdClient.sendCommands(commands, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    });
  });
}

exports.status = function() {
  return sendCommand(Mpd.cmd("status", [])).then(function(msg) {
    return Util.readProps(msg);
  });
};

exports.playlist = function() {
  return sendCommand(Mpd.cmd("playlistinfo", [])).then(function(msg) {
    var playlist = [];
    var entry = {};
    Util.readProps(msg, function(key, value) {
      if (key === "file") {
        entry = {};
        playlist.push(entry);
      }
      entry[key] = value;
    });
    return playlist;
  });
};

exports.play = function(url) {
  var cmds = ["play"];
  if (url) {
    var ext = url.substr(-4).toLowerCase();
    var isPlaylist = ext === ".m3u" || ext === ".pls" || ext === ".asx";
    cmds = ["clear", (isPlaylist ? "load " : "add ") + url, "play"];
  }
  return sendCommands(cmds);
};

exports.replace = function(urls) {
  var cmds = ["clear"];
  urls.forEach(function(url) {
    cmds.push("add \"" + url + "\"");
  });
  cmds.push("play");
  return sendCommands(cmds);
};

exports.append = function(urls) {
  var cmds = [];
  urls.forEach(function(url) {
    cmds.push("add \"" + url + "\"");
  });
  cmds.push("play");
  return sendCommands(cmds);
};

exports.stop = function() {
  return sendCommand("stop");
};

exports.pause = function() {
  return sendCommand("pause");
};

exports.prev = function() {
  return sendCommand("previous");
};

exports.next = function() {
  return sendCommand("next");
};
