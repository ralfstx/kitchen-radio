/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }]*/
import 'source-map-support/register';
import {join} from 'path';

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

let context = new Context(Object.assign({}, defaults, config, {
  stationsDir: join(config.musicDir, 'stations')
}));

let logger = new Logger(context);
context.set('logger', logger);

let albumDB = new AlbumDB(context);
albumDB.update();
context.set('albumDB', albumDB);

let stationDB = new StationDB(context);
stationDB.update();
context.set('stationDB', stationDB);

let coverDB = new CoverDB(context);
context.set('coverDB', coverDB);

let player = new Player(context);
player.connectMpd();
context.set('player', player);

let server = new Server(context);
let httpServer = server.start();
context.set('httpServer', httpServer);

let wsServer = new WSServer(context);
wsServer.start();
context.set('wsServer', wsServer);
