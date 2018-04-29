import { parse as parseUrl } from 'url';
import * as mpd from 'mpd';
import * as fetch from 'node-fetch';
import { AlbumDB } from './AlbumDB';
import { Config } from './Config';
import { Context } from './Context';
import { Logger } from './Logger';
import { isPlaylist, readFiles } from './Playlist';
import { readProps } from './util';

export class Player {

  public onStatusChange: (status: string) => void;
  private logger: Logger;
  private _albumDb: AlbumDB;
  private _config: Config;
  private _mpdClient: any;

  constructor(context: Context) {
    this.logger = context.logger;
    this._albumDb = context.albumDB;
    this._config = context.config;
    // TODO better event mechanism
    this.onStatusChange = null;
  }

  public async connectMpd() {
    return new Promise((resolve, reject) => {
      let host = this._config.mpdHost;
      let port = this._config.mpdPort;
      this._mpdClient = mpd.connect({host, port})
        .on('ready', () => {
          this.logger.info(`Connected to mpd on ${host}, port ${port}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error('mpd error', err);
          reject(err);
        })
        .on('end', () => {
          this.logger.error('mpd disconnected');
        })
        .on('system-player', () => this._notifyStatusChange())
        .on('system-playlist', () => this._notifyStatusChange());
    });
  }

  public async play(pos = 0) {
    return await this._sendCommand('play ' + pos);
  }

  public async stop() {
    return await this._sendCommand('stop');
  }

  public async pause() {
    return await this._sendCommand('pause');
  }

  public async prev() {
    return await this._sendCommand('previous');
  }

  public async next() {
    return await this._sendCommand('next');
  }

  // STATUS REQUESTS

  public async status() {
    let res = await this._sendCommand('status');
    return readProps(res);
  }

  public async playlist() {
    let res = await this._sendCommand('playlistinfo');
    return this._extractPlaylist(res);
  }

  // PLAYLIST MODIFICATION

  public async append(urls) {
    // TODO keep track of changes to playlist
    let playCommands = await this._toCommands(urls);
    await this._sendCommands([...playCommands, 'play']);
  }

  public async replace(urls) {
    // TODO keep track of changes to playlist
    let playCommands = await this._toCommands(urls);
    await this._sendCommands(['clear', ...playCommands, 'play']);
  }

  public async remove(index: string) {
    await this._sendCommand('delete ' + index);
  }

  private _notifyStatusChange() {
    this.logger.info('mpd status changed');
    this._sendCommand('status')
      .then(readProps)
      .then(status => this._notify('onStatusChange', status))
      .catch(() => null); // MPD error logged in _sendCommand
  }

  private _notify(name: string, event: {}) {
    if (name in this) {
      this[name](event);
    }
  }

  private async _sendCommand(command: string) {
    return new Promise((resolve, reject) => {
      this._mpdClient.sendCommand(command, (err, result) => {
        if (err) {
          this.logger.error(`Failed to send mpd command '${command}'`, err);
          reject(new Error('Command failed'));
        } else {
          this.logger.debug(`Sent mpd command '${command}'`);
          resolve(result);
        }
      });
    }) as Promise<string>;
  }

  private async _sendCommands(commands: string[]) {
    return new Promise((resolve, reject) => {
      this._mpdClient.sendCommands(commands, (err, result) => {
        let commandsStr = commands.map(command => `'${command}'`).join(', ');
        if (err) {
          this.logger.error(`Failed to send mpd commands ${commandsStr}`, err);
          reject(new Error('Command failed'));
        } else {
          this.logger.debug(`Sent mpd commands ${commandsStr}`);
          resolve(result);
        }
      });
    }) as Promise<string>;
  }

  private _extractPlaylist(msg: string) {
    let playlist: any[] = [];
    let entry = {};
    readProps(msg, (key, value) => {
      if (key === 'file') {
        entry = {};
        playlist.push(entry);
      }
      entry[key] = value;
    });
    return playlist.map(item => this._processPlaylistEntry(item));
  }

  private _processPlaylistEntry(item: any) {
    let url = parseUrl(item.file);
    if (url.hostname === 'localhost') {
      let info = this._extractTrackInfo(url.pathname);
      if (info) {
        let track = this._findTrack(info);
        if (track) {
          return {
            file: url.pathname,
            album: info.album,
            disc: info.disc,
            track: info.track,
            name: track.title,
            time: track.length
          };
        }
      }
    }
    return {
      file: item.file,
      name: item.Name || item.Title || '?',
      time: item.Time
    };
  }

  private _extractTrackInfo(path: string | undefined) {
    let parts = path.split('/').filter(part => part.length);
    if (parts[0] === 'albums') {
      let album = parts[1];
      if (parts[2] === 'tracks') {
        return {album, disc: 1, track: parseInt(parts[3])};
      } else if (parts[2] === 'discs' && parts[4] === 'tracks') {
        return {album, disc: parseInt(parts[3]), track: parseInt(parts[5])};
      }
    }
    return null;
  }

  private _findTrack(info: { album: any; disc: number; track: number; }) {
    let album = this._albumDb.getAlbum(info.album);
    if (!album) return null;
    let disc = album.discs[info.disc - 1];
    if (!disc) return null;
    let track = disc.tracks[info.track - 1];
    if (!track) return null;
    return track;
  }

  private async _toCommands(urls: any) {
    let commands: string[] = [];
    for (let url of urls) {
      if (url.startsWith('/')) {
        url = 'http://localhost:' + this._config.port + url;
      }
      if (isPlaylist(url)) {
        let content = await getText(url);
        let tracks = readFiles(content);
        tracks.forEach(track => commands.push('add "' + track + '"'));
      } else {
        commands.push('add "' + url + '"');
      }
    }
    return commands;
  }

}

async function getText(url: any) {
  let response = await fetch(url);
  return await response.text();
}
