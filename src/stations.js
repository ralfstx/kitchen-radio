var Fs = require("fs");

var musicdb = require("./config.js");
var Server = require("./server.js");
var Util = require("./util.js");

exports.list = function(response) {
  var filepath = musicdb.baseDir + "/stations/.index";
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
  var path = musicdb.baseDir + "/stations/" + file + "/info";
  Fs.exists(path, function(exists) {
    if (exists) {
//      callback(null, file);
      Util.readPropFile(path, function(err, data) {
        if (err) {
          callback(err);
        } else {
          callback(null, data);
        }
      });
    } else {
      callback(new Error("file not found:", path));
    }
  });
}
