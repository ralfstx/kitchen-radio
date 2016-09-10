/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }]*/
import 'source-map-support/register';
import {join} from 'path';

import config from './lib/config';
import AlbumDB from './lib/AlbumDB';
import StationDB from './lib/StationDB';
import Player from './lib/Player';
import Server from './lib/Server';

const port = config.get('port') || 8080;

const mpdHost = config.get('mpdHost') || 'localhost';
const mpdPort = config.get('mpdPort') || 6600;

const albumsDir = join(config.get('musicDir'), 'albums');
const stationsDir = join(config.get('musicDir'), 'stations');

let albumDB = new AlbumDB(albumsDir);
albumDB.update();
config.set('instance:AlbumDB', albumDB);

let stationDB = new StationDB(stationsDir);
stationDB.update();
config.set('instance:StationDB', stationDB);

let player = new Player();
player.connectMpd(mpdHost, mpdPort);
config.set('instance:Player', player);

let server = new Server();
server.start(port);
config.set('instance:Server', server);
