import websocket from 'websocket';

export default class WSServer {

  constructor(context) {
    this.logger = context.logger;
    this._player = context.player;
    this._httpServer = context.httpServer;
    this._connections = new Connections();
    this._player.onStatusChange = status => this.broadcast('status', status);
  }

  start() {
    let wsServer = new websocket.server({httpServer: this._httpServer});
    wsServer.on('request', request => this._handleRequest(request));
    wsServer.on('connect', connection => this._handleConnect(connection));
    wsServer.on('close', (connection, reason, desc) => this._handleDisconnect(connection, reason, desc));
  }

  _handleRequest(request) {
    this.logger.info(`Connection request from ${request.origin}`);
    request.accept('player', request.origin);
  }

  _handleConnect(connection) {
    this.logger.info(`Connection accepted from ${connection.remoteAddress}`);
    this._connections.add(connection);
    connection.on('message', message => this._handleMessage(message, connection));
  }

  _handleDisconnect(connection, reason, description) {
    this.logger.info(`Peer ${connection.remoteAddress} disconnected: ${description}`);
    this._connections.remove(connection);
  }

  _handleMessage(message, connection) {
    if (message.type === 'utf8') {
      let data = JSON.parse(message.utf8Data);
      let handlers = {
        play: (args) => this._player.play(args.pos || 0),
        pause: () => this._player.pause(),
        prev: () => this._player.prev(),
        next: () => this._player.next(),
        stop: () => this._player.stop(),
        append: (args) => this._player.append(args),
        replace: (args) => this._player.replace(args),
        remove: (args) => this._player.remove(args.pos),
        status: () => this._player.status().then(status => this._send(connection, 'status', status)),
        playlist: () => this._player.playlist().then(playlist => this._send(connection, 'playlist', playlist)),
      };
      if (data.command in handlers) {
        handlers[data.command](data.args || {});
      }
    }
  }

  broadcast(topic, args) {
    this._connections.forEach(connection => this._send(connection, topic, args));
  }

  _send(connection, topic, args) {
    connection.sendUTF(JSON.stringify({topic, args}));
  }

}

class Connections {

  constructor() {
    this._connections = [];
  }

  add(connection) {
    this._connections.push(connection);
  }

  remove(connection) {
    this._connections = this._connections.filter(element => element !== connection);
  }

  forEach(cb) {
    this._connections.forEach(cb);
  }

}
