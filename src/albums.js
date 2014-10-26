var Fs = require("fs");
var Path = require("path");

var Config = require("./config.js");
var Server = require("./server.js");
var Util = require("./util.js");

exports.list = function(response) {
  var filepath = Config.baseDir + "/albums/index.json";
  Fs.exists(filepath, function(exists) {
    if (exists) {
      Server.writeFile(response, filepath);
    } else {
      var safe = Util.safeRunner(function(err) {
        Server.writeJson(response, {error: err.message, stack: err.stack}, 500);
      });
      buildIndex(safe(function(index) {
        Fs.writeFile(filepath, Util.toJson(index), safe(function() {
          Server.writeFile(response, filepath);
        }));
      }));
    }
  });
};

function buildIndex(callback) {
  var safe = Util.safeRunner(callback);
  var path = Config.baseDir + "/albums/";
  var index = [];
  Fs.readdir(path, safe(function(files) {
    Util.walk(files, function(file, next) {
      var filepath = path + file;
      Fs.stat(filepath, safe(function(stats) {
        if (stats.isDirectory()) {
          getAlbumInfo(file, safe(function(info) {
            index.push(info);
            next();
          }));
        } else {
          next();
        }
      }));
    }, function() {
      callback(null, index);
    });
  }));
}

function getAlbumInfo(file, callback) {
  var safe = Util.safeRunner(callback);
  var path = Path.join(Config.baseDir, "albums", file, "info");
  Fs.exists(path, function(exists) {
    if (exists) {
      Fs.readFile(path, {encoding: "utf8"}, safe(function(data) {
        callback(null, {
          path: file,
          name: data.split("\n", 1)[0]
        });
      }));
    } else {
      callback(new Error("File not found:", path));
    }
  });
}
