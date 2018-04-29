import 'source-map-support/register';
import {join} from 'path';

import {Context} from './lib/Context';
import {Config} from './lib/Config';
import {Logger} from './lib/Logger';
import {AlbumDB} from './lib/AlbumDB';
import {StationDB} from './lib/StationDB';
import {CoverDB} from './lib/CoverDB';
import {Player} from './lib/Player';
import {Server} from './lib/Server';
import {WSServer} from './lib/WSServer';

start().catch(err => {
  // tslint:disable-next-line:no-console
  console.error(err);
  process.exit(1);
});

async function start() {
  let context = new Context({});
  let config = await Config.readFromFile(join(__dirname, 'config.json'));
  context.set('config', config);
  context.set('logger', new Logger(config));
  context.set('coverDB', new CoverDB(context));
  context.set('albumDB', new AlbumDB(context));
  context.set('stationDB', new StationDB(context));
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
