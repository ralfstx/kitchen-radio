import { IMessage, connection as Connection, request as Request, server as WebSocketServer } from 'websocket';
import { Context } from './Context';
import { Logger } from './Logger';
import { Player } from './Player';
import { Server } from './Server';

export class WSServer {

  private _logger: Logger;
  private _player: Player;
  private _server: Server;
  private _connections: Set<Connection>;

  private _handlers: {[key: string]: Handler} = {
    play: (args) => this._player.play(args.pos || 0),
    pause: () => this._player.pause(),
    prev: () => this._player.prev(),
    next: () => this._player.next(),
    stop: () => this._player.stop(),
    append: (args) => this._player.append(args),
    replace: (args) => this._player.replace(args),
    remove: (args) => this._player.remove(args.pos),
    status: (args, connection) => this._player.status()
        .then(status => sendJson(connection, 'status', status)),
    playlist: (args, connection) => this._player.playlist()
        .then(playlist => sendJson(connection, 'playlist', playlist))
  };

  constructor(context: Context) {
    this._logger = context.logger;
    this._player = context.player;
    this._server = context.server;
    this._connections = new Set();
    this._player.onStatusChange = status => this.broadcast('status', status);
  }

  public start() {
    let wsServer = new WebSocketServer({httpServer: this._server.httpServer});
    wsServer.on('request', request => this._handleRequest(request));
    wsServer.on('connect', connection => this._handleConnect(connection));
    wsServer.on('close', (connection, reason, desc) => this._handleDisconnect(connection, reason, desc));
  }

  private _handleRequest(request: Request) {
    this._logger.info(`Connection request from ${request.origin}`);
    request.accept('player', request.origin);
  }

  private _handleConnect(connection: Connection) {
    this._logger.info(`Connection accepted from ${connection.remoteAddress}`);
    this._connections.add(connection);
    connection.on('message', message => this._handleMessage(message, connection));
  }

  private _handleDisconnect(connection: Connection, reason: number, description: string) {
    this._logger.info(`Peer ${connection.remoteAddress} disconnected: ${description}`);
    this._connections.delete(connection);
  }

  private _handleMessage(message: IMessage, connection: Connection) {
    if (message.type === 'utf8') {
      let data = JSON.parse(message.utf8Data);
      if (data.command in this._handlers) {
        this._handlers[data.command](data.args || {}, connection)
          .catch(err => sendJson(connection, 'error', err.message || 'Command failed'));
      }
    }
  }

  public broadcast(topic: string, args: any) {
    this._connections.forEach(connection => sendJson(connection, topic, args));
  }

}

function sendJson(connection: Connection, topic: string, args: any) {
  this.logger.debug('Sent WS message to ', connection.remoteAddress, topic, args);
  connection.sendUTF(JSON.stringify({topic, args}));
}

type Handler = (args: any, connection: Connection) => Promise<any>;
