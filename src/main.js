/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }]*/
import 'source-map-support/register';
import {join} from 'path';

import Context from './lib/Context';
import Logger from './lib/Logger';
import AlbumDB from './lib/AlbumDB';
import StationDB from './lib/StationDB';
import Player from './lib/Player';
import Server from './lib/Server';
import WSServer from './lib/WSServer';
import config from './config.json';

const defaults = {
  port: 8080,
  mpdHost: 'localhost',
  mpdPort: 6600
};

let context = new Context(Object.assign({}, defaults, config, {
  albumsDir: join(config.musicDir, 'albums'),
  stationsDir: join(config.musicDir, 'stations')
}));

let logger = new Logger(context);
context.set('logger', logger);

let albumDB = new AlbumDB(context);
albumDB.update();
context.set('instance:AlbumDB', albumDB);

let stationDB = new StationDB(context);
stationDB.update();
context.set('instance:StationDB', stationDB);

let player = new Player(context);
player.connectMpd();
context.set('instance:Player', player);

let server = new Server(context);
let httpServer = server.start();
context.set('instance:HttpServer', httpServer);
context.set('instance:Server', server);

let wsServer = new WSServer(context);
wsServer.start();
context.set('instance:WSServer', wsServer);
