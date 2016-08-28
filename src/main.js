import {join} from 'path';

import config from './lib/config';
import * as player from './lib/player';
import * as server from './lib/server';
import * as albums from './albums';
import * as stations from './stations';

let webDir = join(__dirname, 'web');

server.addHandlers(albums.requestHandlers);
server.addHandlers(stations.requestHandlers);
server.addHandlers({
  status: function(request, response) {
    player.status().then((status) => {
      server.writeJson(response, status);
    });
  },
  playlist: function(request, response) {
    player.playlist().then((status) => {
      server.writeJson(response, status);
    });
  },
  play: function(request, response, path) {
    player.play(path).then(() => {
      server.writeJson(response, {});
    });
  },
  stop: function(request, response) {
    player.stop().then(() => {
      server.writeJson(response, {});
    });
  },
  pause: function(request, response) {
    player.pause().then(() => {
      server.writeJson(response, {});
    });
  },
  prev: function(request, response) {
    player.prev().then(() => {
      server.writeJson(response, {});
    });
  },
  next: function(request, response) {
    player.next().then(() => {
      server.writeJson(response, {});
    });
  },
  replace: function(request, response) {
    return server.readBody(request)
      .then(body => JSON.parse(body))
      .then(urls => player.replace(urls))
      .then(() => {
        server.writeJson(response, {});
      });
  },
  append: function(request, response) {
    return server.readBody(request)
      .then(body => JSON.parse(body))
      .then(urls => player.append(urls))
      .then(() => {
        server.writeJson(response, {});
      });
  }
});
server.addHandlers({
  'files': server.createFileHandler(config.get('musicDir'), {
    index: 'index.json'
  })
});
server.addHandlers({
  '': server.createFileHandler(webDir, {
    index: 'index.html'
  })
});

server.start();
