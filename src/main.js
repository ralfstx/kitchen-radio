import 'source-map-support/register';
import {join} from 'path';
import {readJson} from 'fs-extra';

import Context from './lib/Context';
import Logger from './lib/Logger';
import AlbumDB from './lib/AlbumDB';
import StationDB from './lib/StationDB';
import CoverDB from './lib/CoverDB';
import Player from './lib/Player';
import Server from './lib/Server';
import WSServer from './lib/WSServer';

const DEFAULT_CONFIG = {
  port: 8080,
  mpdHost: 'localhost',
  mpdPort: 6600
};


start().catch(err => {
  throw new Error(err);
});

async function start() {
  let config = await readConfig(join(__dirname, 'config.json')) || {};
  let context = new Context(Object.assign({}, DEFAULT_CONFIG, config));
  context.set('logger', new Logger(context));
  context.set('albumDB', new AlbumDB(context));
  context.set('stationDB', new StationDB(context));
  context.set('coverDB', new CoverDB(context));
  context.set('player', new Player(context));
  context.set('server', new Server(context));
  context.set('wsServer', new WSServer(context));
  await context.albumDB.update();
  await context.stationDB.update();
  await context.coverDB.init();
  await context.player.connectMpd();
  await context.server.start();
  await context.wsServer.start();
  context.logger.info('Server started');
}

async function readConfig(file) {
  try {
    return await readJson(file);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw new Error(`Could not read config file '${file}': ${err}`);
    }
    return null;
  }
}
