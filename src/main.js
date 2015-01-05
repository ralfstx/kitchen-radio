var Promise = require("bluebird");
var Http = require("http");
var Url = require("url");
var Path = require("path");

var Config = require("./lib/config.js");
var Logger = require("./lib/logger.js");
var Player = require("./lib/player");
var Server = require("./server.js");
var Albums = require("./albums.js");
var Stations = require("./stations.js");

var handlers = {
  "": function(request, response) {
    Server.writeJson(response, {message: "Hello!"});
  },
  status: function(request, response) {
    Player.status().then(function(status) {
      Server.writeJson(response, status);
    });
  },
  playlist: function(request, response) {
    Player.playlist().then(function(status) {
      Server.writeJson(response, status);
    });
  },
  play: function(request, response, path) {
    Player.play(path).then(function() {
      Server.writeJson(response, {});
    });
  },
  stop: function(request, response) {
    Player.stop().then(function() {
      Server.writeJson(response, {});
    });
  },
  pause: function(request, response) {
    Player.pause().then(function() {
      Server.writeJson(response, {});
    });
  },
  prev: function(request, response) {
    Player.prev().then(function() {
      Server.writeJson(response, {});
    });
  },
  next: function(request, response) {
    Player.next().then(function() {
      Server.writeJson(response, {});
    });
  },
  replace: function(request, response) {
    return readData(request).then(function(body) {
      var urls = JSON.parse(body);
      return Player.replace(urls);
    }).then(function() {
      return Server.writeJson(response, {});
    });
  },
  stations: function(request, response, path) {
    return Stations.get(request, response, path);
  },
  albums: function(request, response, path) {
    return Albums.get(request, response, path);
  },
  client: function(request, response, path) {
    return Server.writeFile(response, Path.join("client", path));
  }
};

Http.createServer(handleRequest).listen(Config.port);

Logger.info("Started on port %d", Config.port);

function handleRequest(request, response) {
  return Promise.resolve().then(function() {
    var urlpath = getUrlPath(request);
    Logger.debug("request %s", urlpath);
    var parts = splitPath(urlpath);
    var handler = handlers[parts[0]];
    if (handler) {
      return handler(request, response, parts[1]);
    } else {
      Server.writeJson(response, {error: "Not Found: " + parts[0]}, 404);
    }
  }).catch(function(err) {
    Server.handleError(response, err);
  });
}

function getUrlPath(request) {
  return decodeURIComponent(Url.parse(request.url).pathname).substr(1);
}

function splitPath(path) {
  var start = (path.substr(0, 1) === "/") ? 1 : 0;
  var index = path.indexOf("/", start);
  var head = path.substr(start, index === -1 ? path.length : index);
  var tail = index === -1 ? "" : path.substr(index + 1, path.length);
  return [head, tail];
}

function readData(req) {
  return new Promise(function(resolve, reject) {
    var body = "";
    req.on("data", function (data) {
      body += data;
    });
    req.on("end", function () {
      resolve(body);
    });
    req.on("error", function (err) {
      reject(err);
    });
  });
}
