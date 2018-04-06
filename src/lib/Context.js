import {Logger} from './Logger'; // eslint-disable-line no-unused-vars
import {Config} from './Config'; // eslint-disable-line no-unused-vars
import {AlbumDB} from './AlbumDB'; // eslint-disable-line no-unused-vars
import {StationDB} from './StationDB'; // eslint-disable-line no-unused-vars
import {CoverDB} from './CoverDB'; // eslint-disable-line no-unused-vars
import {Player} from './Player'; // eslint-disable-line no-unused-vars
import {Server} from './Server'; // eslint-disable-line no-unused-vars
import {WSServer} from './WSServer'; // eslint-disable-line no-unused-vars

export class Context {

  /**
   * Creates a new context object with read-only members.
   * @param {{}} values an object to initialize the context
   */
  constructor(values) {
    /** @type {Logger} */
    this.logger;
    /** @type {Config} */
    this.config;
    /** @type {AlbumDB} */
    this.albumDB;
    /** @type {StationDB} */
    this.stationDB;
    /** @type {CoverDB} */
    this.coverDB;
    /** @type {Player} */
    this.player;
    /** @type {Server} */
    this.server;
    /** @type {WSServer} */
    this.wsServer;

    for (let name in values) {
      this.set(name, values[name]);
    }
  }

  set(name, value) {
    Object.defineProperty(this, name, {enumerable: true, value});
  }

}
