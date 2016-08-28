import {join} from 'path';

import config from './lib/config';
import Player from './lib/player';
import Server, {writeJson, readBody, createFileHandler} from './lib/server';
import * as albums from './albums';
import * as stations from './stations';

let webDir = join(__dirname, 'web');

let player = new Player();
let host = config.get('mpdHost') || 'localhost';
let port = config.get('mpdPort') || 6600;
player.connectMpd(host, port);


let server = new Server();
server.addHandlers(albums.requestHandlers);
server.addHandlers(stations.requestHandlers);
server.addHandlers({
  status: function(request, response) {
    player.status().then((status) => {
      writeJson(response, status);
    });
  },
  playlist: function(request, response) {
    player.playlist().then((status) => {
      writeJson(response, status);
    });
  },
  play: function(request, response, path) {
    player.play(path).then(() => {
      writeJson(response, {});
    });
  },
  stop: function(request, response) {
    player.stop().then(() => {
      writeJson(response, {});
    });
  },
  pause: function(request, response) {
    player.pause().then(() => {
      writeJson(response, {});
    });
  },
  prev: function(request, response) {
    player.prev().then(() => {
      writeJson(response, {});
    });
  },
  next: function(request, response) {
    player.next().then(() => {
      writeJson(response, {});
    });
  },
  replace: function(request, response) {
    return readBody(request)
      .then(body => JSON.parse(body))
      .then(urls => player.replace(urls))
      .then(() => {
        writeJson(response, {});
      });
  },
  append: function(request, response) {
    return readBody(request)
      .then(body => JSON.parse(body))
      .then(urls => player.append(urls))
      .then(() => {
        writeJson(response, {});
      });
  }
});
server.addHandlers({
  'files': createFileHandler(config.get('musicDir'), {
    index: 'index.json'
  })
});
server.addHandlers({
  '': createFileHandler(webDir, {
    index: 'index.html'
  })
});

server.start(config.get('port'));
