var Http = require("http");
var Url = require("url");
var Path = require("path");

var Mpd = require("./mpd");
var Server = require("./server.js");
var Stations = require("./stations.js");
var Albums = require("./albums.js");

var port = 8080;

var handlers = {
  status: function(path, response) {
    var safe = Server.safeRunner(response);
    Mpd.status(safe(function(status) {
      Server.writeJson(response, status);
    }));
  },
  playlist: function(path, response) {
    var safe = Server.safeRunner(response);
    Mpd.playlist(safe(function(status) {
      Server.writeJson(response, status);
    }));
  },
  play: function(path, response) {
    var safe = Server.safeRunner(response);
    Mpd.play(path, safe(function() {
      Server.writeJson(response, {});
    }));
  },
  stop: function(path, response) {
    var safe = Server.safeRunner(response);
    Mpd.stop(safe(function() {
      Server.writeJson(response, {});
    }));
  },
  pause: function(path, response) {
    var safe = Server.safeRunner(response);
    Mpd.pause(safe(function() {
      Server.writeJson(response, {});
    }));
  },
  prev: function(path, response) {
    var safe = Server.safeRunner(response);
    Mpd.prev(safe(function() {
      Server.writeJson(response, {});
    }));
  },
  next: function(path, response) {
    var safe = Server.safeRunner(response);
    Mpd.next(safe(function() {
      Server.writeJson(response, {});
    }));
  },
  stations: function(path, response) {
    if (path) {
      Server.writeFile(response, Path.join("/media/music/stations", path));
    } else {
      Stations.list(response);
    }
  },
  albums: function(path, response) {
    if (path) {
      Server.writeFile(response, Path.join("/media/music/albums", path));
    } else {
      Albums.list(response);
    }
  },
  client: function(path, response) {
    Server.writeFile(response, Path.join("client", path));
  }
};

Http.createServer(function(request, response) {
  try {
    var urlpath = decodeURIComponent(Url.parse(request.url).pathname).substr(1);
    /*global console: false */
    console.log(urlpath);
    var parts = splitPath(urlpath);
    if (parts[0] === "") {
      Server.writeJson(response, {message: "Hello!"});
    } else {
      var handler = handlers[parts[0]];
      if (handler) {
        handler(parts[1], response);
      } else {
        Server.writeJson(response, {error: "Not Found: " + parts[0]}, 404);
      }
    }
  } catch (error) {
    response.writeHead(500, {"Content-Type": "text/plain"});
    var text = "ERROR: " + error.message;
    if ("stack" in error) {
      text += "\n\n" + error.stack;
    }
    response.end(text);
  }
}).listen(port);

function splitPath(path) {
  var start = (path.substr(0, 1) === "/") ? 1 : 0;
  var index = path.indexOf("/", start);
  var head = path.substr(start, index === -1 ? path.length : index);
  var tail = index === -1 ? "" : path.substr(index + 1, path.length);
  return [head, tail];
}
