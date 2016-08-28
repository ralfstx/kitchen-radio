let Path = require('path');
let Config = require('./lib/config');
let Player = require('./lib/player');
let Server = require('./lib/server');

let Albums = require('./albums');
let Stations = require('./stations');

let webDir = Path.join(Path.dirname(module.filename), 'web');

Server.addHandlers(Albums.requestHandlers);
Server.addHandlers(Stations.requestHandlers);
Server.addHandlers({
  status: function(request, response) {
    Player.status().then((status) => {
      Server.writeJson(response, status);
    });
  },
  playlist: function(request, response) {
    Player.playlist().then((status) => {
      Server.writeJson(response, status);
    });
  },
  play: function(request, response, path) {
    Player.play(path).then(() => {
      Server.writeJson(response, {});
    });
  },
  stop: function(request, response) {
    Player.stop().then(() => {
      Server.writeJson(response, {});
    });
  },
  pause: function(request, response) {
    Player.pause().then(() => {
      Server.writeJson(response, {});
    });
  },
  prev: function(request, response) {
    Player.prev().then(() => {
      Server.writeJson(response, {});
    });
  },
  next: function(request, response) {
    Player.next().then(() => {
      Server.writeJson(response, {});
    });
  },
  replace: function(request, response) {
    return Server.readBody(request)
      .then(body => JSON.parse(body))
      .then(urls => Player.replace(urls))
      .then(() => {
        Server.writeJson(response, {});
      });
  },
  append: function(request, response) {
    return Server.readBody(request)
      .then(body => JSON.parse(body))
      .then(urls => Player.append(urls))
      .then(() => {
        Server.writeJson(response, {});
      });
  }
});
Server.addHandlers({
  'files': Server.createFileHandler(Config.get('musicDir'), {
    index: 'index.json'
  })
});
Server.addHandlers({
  '': Server.createFileHandler(webDir, {
    index: 'index.html'
  })
});

Server.start();
