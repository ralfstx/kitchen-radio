/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }]*/
import 'source-map-support/register';

import Context from './lib/Context';
import Logger from './lib/Logger';
import AlbumDB from './lib/AlbumDB';
import StationDB from './lib/StationDB';
import CoverDB from './lib/CoverDB';
import Player from './lib/Player';
import Server from './lib/Server';
import WSServer from './lib/WSServer';
import config from './config.json';

const defaults = {
  port: 8080,
  mpdHost: 'localhost',
  mpdPort: 6600
};

let context = new Context(Object.assign({}, defaults, config));

context.set('logger', new Logger(context));
context.set('albumDB', new AlbumDB(context));
context.set('stationDB', new StationDB(context));
context.set('coverDB', new CoverDB(context));
context.set('player', new Player(context));
context.set('server', new Server(context));
context.set('wsServer', new WSServer(context));

start(context).catch(err => {
  throw new Error(err);
});

async function start(context) {
  await context.albumDB.update();
  await context.stationDB.update();
  await context.player.connectMpd();
  await context.server.start();
  await context.wsServer.start();
}
