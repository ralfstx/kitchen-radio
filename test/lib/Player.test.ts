import * as mpd from 'mpd';
import { Album } from '../../src/lib/Album';
import { Context } from '../../src/lib/Context';
import { Player } from '../../src/lib/Player';
import { Track } from '../../src/lib/Track';
import { TrackList } from '../../src/lib/TrackList';
import { catchError, expect, restore, spy, stub } from '../test';

const EXAMPLE_PLAYLIST_RESULT = `
file: http://localhost:8080/albums/aaa/tracks/1
Pos: 1
Id: 23
file: http://localhost:8080/albums/aaa/tracks/2
Pos: 2
Id: 24
file: http://localhost:8080/albums/aaa/discs/2/tracks/1
Pos: 3
Id: 25`;

describe('player', function() {

  let player: Player;
  let mpdClient;

  beforeEach(async function() {
    let logger = {debug: spy(), info: spy(), warn: spy(), error: spy()};
    let albumDB = {
      getAlbum: () => new Album('id', [
        new TrackList([
          new Track('01/01.ogg', {
            title: 'title-1-1',
            length: 100
          }),
          new Track('01/02.ogg', {
            title: 'title-1-2',
            length: 200
          })
        ]),
        new TrackList([
          new Track('02/01.ogg', {
            title: 'title-2-1',
            length: 300
          }),
          new Track('02/02.ogg', {
            title: 'title-2-2',
            length: 400
          })
        ])
      ])
    };
    mpdClient = {
      _listeners: {},
      sendCommand: stub(),
      sendCommands: stub(),
      on(name, fn) {
        this._listeners[name] = fn;
        return this;
      }
    };
    stub(mpd, 'connect').callsFake(() => {
      Promise.resolve().then(() => mpdClient._listeners.ready.call());
      return mpdClient;
    });
    player = new Player(new Context({ logger, albumDB, config: {} }));
    await player.connectMpd();
  });

  afterEach(restore);

  describe('status', function() {

    it('calls status and returns result', async function() {
      mpdClient.sendCommand.callsArgWith(1, null, 'volume: 100\nstate: stop\n');
      let result = await player.status();
      expect(mpdClient.sendCommand).to.have.been.calledWith('status');
      expect(result).to.eql({volume: '100', state: 'stop'});
    });

    it('throws on error', async function() {
      mpdClient.sendCommand.callsArgWith(1, new Error('bang'));
      let err = await catchError(player.status());
      expect(err.message).to.equal('Command failed');
    });

  });

  describe('play', function() {

    it('calls play', async function() {
      mpdClient.sendCommand.callsArgWith(1, null, '');
      await player.play();
      expect(mpdClient.sendCommand).to.have.been.calledWith('play 0');
    });

    it('calls play with position', async function() {
      mpdClient.sendCommand.callsArgWith(1, null, '');
      await player.play(3);
      expect(mpdClient.sendCommand).to.have.been.calledWith('play 3');
    });

    it('throws on error', async function() {
      mpdClient.sendCommand.callsArgWith(1, new Error('bang'));
      let err = await catchError(player.play(3));
      expect(err.message).to.equal('Command failed');
    });

  });

  describe('stop', function() {

    it('calls stop and returns null', async function() {
      mpdClient.sendCommand.callsArgWith(1, null, '');
      await player.stop();
      expect(mpdClient.sendCommand).to.have.been.calledWith('stop');
    });

    it('throws on error', async function() {
      mpdClient.sendCommand.callsArgWith(1, new Error('bang'));
      let err = await catchError(player.stop());
      expect(err.message).to.equal('Command failed');
    });

  });

  describe('append', function() {

    it('calls commands `add` and `play`', async function() {
      mpdClient.sendCommands.callsArgWith(1, null, '');
      await player.append(['foo.mp3', 'bar.mp3']);
      expect(mpdClient.sendCommands).to.have.been.calledWith(['add "foo.mp3"', 'add "bar.mp3"', 'play']);
    });

    // it('calls load for playlists', async function() {
    //   mpdClient.sendCommands.callsArgWith(1, null, '');
    //   await player.append(['foo.m3u']);
    //   expect(mpdClient.sendCommands).to.have.been.calledWith(['load "foo.m3u"', 'play']);
    // });

    it('throws on error', async function() {
      mpdClient.sendCommands.callsArgWith(1, new Error('bang'));
      let err = await catchError(player.append(['foo.mp3']));
      expect(err.message).to.equal('Command failed');
    });

  });

  describe('replace', function() {

    it('calls commands `clear`, `add`, and `play`', async function() {
      mpdClient.sendCommands.callsArgWith(1, null, '');
      await player.replace(['foo.mp3', 'bar.mp3']);
      expect(mpdClient.sendCommands).to.have.been.calledWith(['clear', 'add "foo.mp3"', 'add "bar.mp3"', 'play']);
    });

    // it('calls load for playlists', async function() {
    //   mpdClient.sendCommands.callsArgWith(1, null, '');
    //   await player.replace(['foo.m3u']);
    //   expect(mpdClient.sendCommands).to.have.been.calledWith(['clear', 'load "foo.m3u"', 'play']);
    // });

    it('throws on error', async function() {
      mpdClient.sendCommands.callsArgWith(1, new Error('bang'));
      let err = await catchError(player.replace(['foo.mp3']));
      expect(err.message).to.equal('Command failed');
    });

  });

  describe('remove', function() {

    it('calls remove with position', async function() {
      mpdClient.sendCommand.callsArgWith(1, null, '');
      await player.remove('3');
      expect(mpdClient.sendCommand).to.have.been.calledWith('delete 3');
    });

    it('throws on error', async function() {
      mpdClient.sendCommand.callsArgWith(1, new Error('bang'));
      let err = await catchError(player.remove('3'));
      expect(err.message).to.equal('Command failed');
    });

  });

  describe('playlist', function() {

    it('calls playlistinfo', async function() {
      mpdClient.sendCommand.callsArgWith(1, null, EXAMPLE_PLAYLIST_RESULT);
      let result = await player.playlist();
      expect(mpdClient.sendCommand).to.have.been.calledWith('playlistinfo');
      expect(result).to.eql([
        {
          file: '/albums/aaa/tracks/1',
          album: 'aaa',
          disc: 1,
          track: 1,
          name: 'title-1-1',
          time: 100
        },
        {
          file: '/albums/aaa/tracks/2',
          album: 'aaa',
          disc: 1,
          track: 2,
          name: 'title-1-2',
          time: 200
        },
        {
          file: '/albums/aaa/discs/2/tracks/1',
          album: 'aaa',
          disc: 2,
          track: 1,
          name: 'title-2-1',
          time: 300
        }
      ]);
    });

    it('throws on error', async function() {
      mpdClient.sendCommand.callsArgWith(1, new Error('bang'));
      let err = await catchError(player.playlist());
      expect(err.message).to.equal('Command failed');
    });

  });

});
