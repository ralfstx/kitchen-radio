var mpd = require("mpd");
var Util = require("./util");

var mpdClient;

var config = {
  port: 6600,
  host: "localhost"
};

connectMpd();

function connectMpd() {
  mpdClient = mpd.connect(config).on("end", connectMpd);
}

exports.status = function(callback) {
  mpdClient.sendCommand(mpd.cmd("status", []), function(err, msg) {
    if (err) return callback(err);
    callback(undefined, Util.readProps(msg));
  });
};

exports.playlist = function(callback) {
  mpdClient.sendCommand(mpd.cmd("playlistinfo", []), function(err, msg) {
    if (err) return callback(err);
    var playlist = [];
    var entry = {};
    Util.readProps(msg, function(key, value) {
      if (key === "file") {
        entry = {};
        playlist.push(entry);
      }
      entry[key] = value;
    });
    callback(undefined, playlist);
  });
};

exports.play = function(url, callback) {
  var cmds = ["play"];
  if (url) {
    var ext = url.substr(-4).toLowerCase();
    var isPlaylist = ext === ".m3u" || ext === ".pls" || ext === ".asx";
    cmds = ["clear", (isPlaylist ? "load " : "add ") + url, "play"];
  }
  mpdClient.sendCommands(cmds, function(err, msg) {
    callback(err, msg);
  });
};

exports.replace = function(urls, callback) {
  var cmds = ["clear"];
  urls.forEach(function(url) {
    cmds.push("add \"" + url + "\"");
  });
  cmds.push("play");
  mpdClient.sendCommands(cmds, function(err, msg) {
    callback(err, msg);
  });
};

exports.stop = function(callback) {
  mpdClient.sendCommand("stop", function(err, msg) {
    callback(err, msg);
  });
};

exports.pause = function(callback) {
  mpdClient.sendCommand("pause", function(err, msg) {
    callback(err, msg);
  });
};

exports.prev = function(callback) {
  mpdClient.sendCommand("previous", function(err, msg) {
    callback(err, msg);
  });
};

exports.next = function(callback) {
  mpdClient.sendCommand("next", function(err, msg) {
    callback(err, msg);
  });
};
