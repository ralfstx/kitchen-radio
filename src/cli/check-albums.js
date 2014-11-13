/*global console: false */
var Fs = require("fs");
var Path = require("path");
var Magick = require("imagemagick");

var Config = require("../config");
var Util = require("../util");

var ALBUMS = Path.join(Config.baseDir, "albums");

var stat = {};

Fs.readdirSync(ALBUMS).forEach(function(file) {
  var dir = Path.join(ALBUMS, file);
  if (Fs.statSync(dir).isDirectory()) {
    checkAlbum(dir);
    count("albums checked");
  }
});
for (var key in stat) {
  console.log(stat[key] + " " + key);
}

function count(name, increment) {
  stat[name] = (stat[name] || 0) + (increment || 1);
}

function checkAlbum(dir) {
  checkIndex(dir);
  checkCover(dir);
}

function checkIndex(dir) {
  var index = createIndex(dir);
  var file = Path.join(dir, "index.json");
  if (Fs.existsSync(file)) {
    var index = JSON.parse(Fs.readFileSync(file, {encoding: "utf-8"}));
    if (!index.name) {
      console.log("missing album name for " + dir);
      count("albums with missing name", 1);
    }
  } else {
    var index = createIndex(dir);
    Fs.writeFileSync(file, Util.toJson(index));
  }
}

function createIndex(dir) {
  var index = {};
  index.name = "";
  var tracks = getTracksIndex(dir);
  if (tracks.length) {
    index.tracks = tracks;
  }
  var discs = getDiscsIndex(dir);
  if (discs.length) {
    index.discs = discs;
  }
  return index;
}

function getDiscsIndex(dir) {
  return getSubDirs(dir).map(function(subdir) {
    var tracks = getTracksIndex(Path.join(dir, subdir));
    if (tracks.length) {
      return {path: subdir, tracks: tracks};
    }
  }).filter(function(disc) {
    return !!disc;
  });
}

function getTracksIndex(dir) {
  return findTracks(dir).map(function(path) {
    return {path: path};
  });
}

function findTracks(dir) {
  return Fs.readdirSync(dir).filter(function(file) {
    return file.substr(-4) === ".mp3" || file.substr(-4) === ".ogg";
  });
}

function checkCover(path) {
  var srcPath = Path.join(path, "cover.jpg");
  if (!Fs.existsSync(srcPath)) {
    console.error("Missing: " + srcPath);
  } else {
    [100, 250].forEach(function(size) {
      var dstPath = Path.join(path, "cover-" + size + ".jpg");
      if (!Fs.existsSync(dstPath)) {
        resizeCover(srcPath, dstPath, size);
      }
    });
  }
}

function resizeCover(srcPath, dstPath, size) {
  Magick.resize({
    srcPath: srcPath,
    dstPath: dstPath,
    width: size,
    height: size
  }, function(err) {
    if (err)
      console.error(err);
    else
      console.log("created " + dstPath);
  });
}

function getSubDirs(dir) {
  return Fs.readdirSync(dir).filter(function(file) {
    return Fs.statSync(Path.join(dir, file)).isDirectory();
  });
}
