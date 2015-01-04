var Http = require("http");
var Url = require("url");
var Path = require("path");

var Config = require("./lib/config.js");
var Logger = require("./lib/logger.js");
var Player = require("./lib/player");
var Server = require("./server.js");
var Stations = require("./stations.js");
var Albums = require("./albums.js");

var handlers = {
  status: function(path, response) {
    var safe = Server.safeRunner(response);
    Player.status(safe(function(status) {
      Server.writeJson(response, status);
    }));
  },
  playlist: function(path, response) {
    var safe = Server.safeRunner(response);
    Player.playlist(safe(function(status) {
      Server.writeJson(response, status);
    }));
  },
  play: function(path, response) {
    var safe = Server.safeRunner(response);
    Player.play(path, safe(function() {
      Server.writeJson(response, {});
    }));
  },
  stop: function(path, response) {
    var safe = Server.safeRunner(response);
    Player.stop(safe(function() {
      Server.writeJson(response, {});
    }));
  },
  pause: function(path, response) {
    var safe = Server.safeRunner(response);
    Player.pause(safe(function() {
      Server.writeJson(response, {});
    }));
  },
  prev: function(path, response) {
    var safe = Server.safeRunner(response);
    Player.prev(safe(function() {
      Server.writeJson(response, {});
    }));
  },
  next: function(path, response) {
    var safe = Server.safeRunner(response);
    Player.next(safe(function() {
      Server.writeJson(response, {});
    }));
  },
  replace: function(path, response, req) {
    var body = "";
    req.on("data", function (data) {
      body += data;
    });
    req.on("end", function () {
      var urls = JSON.parse(body);
      var safe = Server.safeRunner(response);
      Player.replace(urls, safe(function() {
        Server.writeJson(response, {});
      }));
    });
  },
  stations: function(path, response) {
    return Stations.get(response, path);
  },
  albums: function(path, response) {
    return Albums.get(response, path);
  },
  client: function(path, response) {
    Server.writeFile(response, Path.join("client", path));
  }
};

Http.createServer(function(request, response) {
  try {
    var urlpath = decodeURIComponent(Url.parse(request.url).pathname).substr(1);
    Logger.debug("request %s", urlpath);
    var parts = splitPath(urlpath);
    if (parts[0] === "") {
      Server.writeJson(response, {message: "Hello!"});
    } else {
      var handler = handlers[parts[0]];
      if (handler) {
        handler(parts[1], response, request);
      } else {
        Server.writeJson(response, {error: "Not Found: " + parts[0]}, 404);
      }
    }
  } catch (error) {
    Logger.error(error.stack ? error.stack : error.message);
    Server.writeJson(response, {error: error.message}, 500);
  }
}).listen(Config.port);

Logger.info("Started on port %d", Config.port);

function splitPath(path) {
  var start = (path.substr(0, 1) === "/") ? 1 : 0;
  var index = path.indexOf("/", start);
  var head = path.substr(start, index === -1 ? path.length : index);
  var tail = index === -1 ? "" : path.substr(index + 1, path.length);
  return [head, tail];
}
