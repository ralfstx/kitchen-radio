var Path = require("path");
var Config = require("./lib/config");
var Player = require("./lib/player");

var Server = require("./server");
var Albums = require("./albums");
var Stations = require("./stations");

var webDir = Path.join(Path.dirname(module.filename), "web");
Server.addHandlers({
  "": Server.createFileHandler(webDir, {
    index: "index.html"
  })
});

var handlers = {
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
    return Server.readBody(request).then(function(body) {
      var urls = JSON.parse(body);
      return Player.replace(urls);
    }).then(function() {
      return Server.writeJson(response, {});
    });
  }
};

Server.addHandlers(handlers);
Server.addHandlers(Albums.requestHandlers);
Server.addHandlers(Stations.requestHandlers);
Server.addHandlers({
  "files": Server.createFileHandler(Config.musicDir, {
    index: "index.json"
  })
});

Server.start();
