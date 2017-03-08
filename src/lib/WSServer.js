import websocket from 'websocket';

export default class WSServer {

  constructor(context) {
    this.logger = context.get('logger');
    this._player = context.get('instance:Player');
    this._httpServer = context.get('instance:HttpServer');
    this._connections = new Connections();
    this._player.onPlaylistChange = playlist => this.broadcast('playlist', playlist);
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
    connection.on('message', message => this._handleMessage(message));
  }

  _handleDisconnect(connection, reason, description) {
    this.logger.info(`Peer ${connection.remoteAddress} disconnected: ${description}`);
    this._connections.remove(connection);
  }

  _handleMessage(message) {
    if (message.type === 'utf8') {
      let data = JSON.parse(message.utf8Data);
      let command = data.command;
      if (command === 'play') {
        this._player.play();
      } else if (command === 'pause') {
        this._player.pause();
      } else if (command === 'prev') {
        this._player.prev();
      } else if (command === 'next') {
        this._player.next();
      } else if (command === 'append') {
        this._player.append(data.args);
      } else if (command === 'replace') {
        this._player.replace(data.args);
      } else if (command === 'status') {
        this._player.status();
      } else if (command === 'playlist') {
        this._player.playlist();
      }
    }
  }

  broadcast(topic, args) {
    this._connections.forEach(connection => connection.sendUTF(JSON.stringify({topic, args})));
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
