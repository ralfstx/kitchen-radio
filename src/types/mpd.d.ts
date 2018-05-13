declare module 'mpd' {

  import { EventEmitter } from 'events';

  /** Convert name/args pair into a Command. */
  export function cmd(name: string, args: any): Command;

  /** Connects and returns a client. */
  export function connect(options: Options): Client;

  interface Options {
    host: string;
    port: number;
  }

  interface Client extends EventEmitter {

    /** Sends a command to MPD. */
    sendCommand(command: Command | string, callback: (err: any, msg: string) => void): void;

    /** Sends a list of commands to MPD. */
    sendCommands(commandList: Command[] | string[], callback: (err: any, msg: string) => void): void;
  }

  class Command {
    public name: string;
    public args: any[];
    public toString(): string;
  }

}
