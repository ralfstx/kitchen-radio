import { AlbumDB } from './AlbumDB';
import { Config } from './Config';
import { CoverDB } from './CoverDB';
import { Logger } from './Logger';
import { Player } from './Player';
import { Server } from './Server';
import { StationDB } from './StationDB';
import { WSServer } from './WSServer';

export class Context {

  public readonly logger: Logger | undefined;
  public readonly albumDB: AlbumDB | undefined;
  public readonly stationDB: StationDB | undefined;
  public readonly player: Player | undefined;
  public readonly server: Server | undefined;
  public readonly wsServer: WSServer | undefined;
  public readonly coverDB: CoverDB | undefined;
  public readonly config: Config | undefined;

  /**
   * Creates a new context object with read-only members.
   * @param values an object to initialize the context
   */
  constructor(values: ContextValues) {
    for (let name in values) {
      this.set(name, values[name]);
    }
  }

  public set(name: string, value: any) {
    Object.defineProperty(this, name, {enumerable: true, value});
  }

}

interface ContextValues {
  logger?: any;
  albumDB?: any;
  stationDB?: any;
  player?: any;
  server?: any;
  wsServer?: any;
  coverDB?: any;
  config?: any;
}
