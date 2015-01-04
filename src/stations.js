var Fs = require("fs");

var musicdb = require("./lib/config.js");
var Util = require("./lib/util.js");
var Server = require("./server.js");

exports.list = function(response) {
  var filepath = musicdb.baseDir + "/stations/index.json";
  Fs.exists(filepath, function(exists) {
    if (exists) {
      Server.writeFile(response, filepath);
    } else {
      var safe = Server.safeRunner(response);
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
  var path = musicdb.baseDir + "/stations/";
  var index = [];
  Fs.readdir(path, safe(function(files) {
    Util.walk(files, function(file, next) {
      var filepath = path + file;
      Fs.stat(filepath, safe(function(stats) {
        if (stats.isDirectory()) {
          getStationInfo(file, safe(function(info) {
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

function getStationInfo(file, callback) {
  var safe = Util.safeRunner(callback);
  var path = musicdb.baseDir + "/stations/" + file + "/index.json";
  Fs.exists(path, function(exists) {
    if (exists) {
      Fs.readFile(path, {encoding: "utf8"}, safe(function(data) {
        callback(null, JSON.parse(data));
      }));
    } else {
      callback(new Error("file not found:", path));
    }
  });
}
