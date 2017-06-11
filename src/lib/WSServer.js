import {server as WebSocketServer} from 'websocket';

const HANDLERS = {
  play(args) {
    return this._player.play(args.pos || 0);
  },
  pause() {
    return this._player.pause();
  },
  prev() {
    return this._player.prev();
  },
  next() {
    return this._player.next();
  },
  stop() {
    return this._player.stop();
  },
  append(args) {
    return this._player.append(args);
  },
  replace(args) {
    return this._player.replace(args);
  },
  remove(args) {
    return this._player.remove(args.pos);
  },
  status(args, connection) {
    return this._player.status().then(status => this._sendJson(connection, 'status', status));
  },
  playlist(args, connection) {
    return this._player.playlist().then(playlist => this._sendJson(connection, 'playlist', playlist));
  }
};

export default class WSServer {

  constructor(context) {
    this.logger = context.logger;
    this._player = context.player;
    this._server = context.server;
    this._connections = new Connections();
    this._player.onStatusChange = status => this.broadcast('status', status);
  }

  start() {
    let wsServer = new WebSocketServer({httpServer: this._server.httpServer});
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
      if (data.command in HANDLERS) {
        HANDLERS[data.command].call(this, data.args || {}, connection)
          .catch(err => this._sendJson(connection, 'error', err.message || 'Command failed'));
      }
    }
  }

  broadcast(topic, args) {
    this._connections.forEach(connection => this._sendJson(connection, topic, args));
  }

  _sendJson(connection, topic, args) {
    this.logger.debug('Sent WS message to ', connection.remoteAddress, topic, args);
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
