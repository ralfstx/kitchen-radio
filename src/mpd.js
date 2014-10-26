var mpd = require("mpd");
var Util = require("./util");

var client = mpd.connect({
  port: 6600,
  host: "localhost"
});

// client.on("ready", function() {
//   console.log("ready");
// });
// client.on("system", function(name) {
//   console.log("update", name);
// });
// client.on("system-player", function() {
// });

exports.status = function(callback) {
  client.sendCommand(mpd.cmd("status", []), function(err, msg) {
    if (err) return callback(err);
    callback(undefined, Util.readProps(msg));
  });
};

exports.playlist = function(callback) {
  client.sendCommand(mpd.cmd("playlistinfo", []), function(err, msg) {
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
  client.sendCommands(cmds, function(err, msg) {
    callback(err, msg);
  });
};

exports.stop = function(callback) {
  client.sendCommand("stop", function(err, msg) {
    callback(err, msg);
  });
};

exports.pause = function(callback) {
  client.sendCommand("pause", function(err, msg) {
    callback(err, msg);
  });
};

exports.prev = function(callback) {
  client.sendCommand("previous", function(err, msg) {
    callback(err, msg);
  });
};

exports.next = function(callback) {
  client.sendCommand("next", function(err, msg) {
    callback(err, msg);
  });
};
