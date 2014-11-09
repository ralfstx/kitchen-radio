/*global console: false */
var Fs = require("fs");
var Path = require("path");
var Magick = require("imagemagick");

var Config = require("../config");
var Util = require("../util");

var ALBUMS = Path.join(Config.baseDir, "albums");

var count = 0;
Fs.readdirSync(ALBUMS).forEach(function(file) {
  if (Fs.statSync(Path.join(ALBUMS, file)).isDirectory()) {
    checkAlbum(file);
    count++;
  }
});
console.log(count + " albums checked");

function checkAlbum(path) {
  var dir = Path.join(ALBUMS, path);
  checkIndex(dir);
//  checkPlaylist(dir);
  checkCover(dir);
}

function checkIndex(dir) {
  var file = Path.join(dir, "index.json");
  if (!Fs.existsSync(file)) {
    var index = createIndex(dir);
    Fs.writeFileSync(file, Util.toJson(index));
  }
}

function createIndex(dir, info) {
  var index = info || {};
  var tracks = findTracks(dir);
  if (tracks.length) {
    index.tracks = tracks.map(function(path) {
      return {path: path};
    });
  }
  var discs = Fs.readdirSync(dir).filter(function(file) {
    return Fs.statSync(Path.join(dir, file)).isDirectory();
  }).map(function(subdir) {
    return {path: subdir, tracks: findTracks(Path.join(dir, subdir))};
  }).filter(function(disc) {
    return disc.tracks.length > 0;
  });
  if (discs.length) {
    index.discs = discs;
  }
  return index;
}

function checkPlaylist(dir) {
  var file = Path.join(dir, "album.m3u");
  if (!Fs.existsSync(file)) {
    var playlist = createPlaylist(dir);
    if (playlist) {
      Fs.writeFileSync(file, playlist.join("\n"));
    } else {
      console.warn("Missing: " + file);
    }
  }
}

function createPlaylist(dir) {
  var tracks = findTracks(dir);
  if (tracks.length) {
    return tracks;
  }
  var subdirs = Fs.readdirSync(dir).filter(function(file) {
    return Fs.statSync(Path.join(dir, file)).isDirectory();
  });
  subdirs.map(function(subdir) {
    findTracks(Path.join(dir, subdir));
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
