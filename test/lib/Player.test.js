import {expect, spy, stub, restore} from '../test';

import {Album} from '../../src/lib/album-types';
import Context from '../../src/lib/Context';
import Player from '../../src/lib/Player';

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

  let player, mpdClient;

  beforeEach(function() {
    let logger = {info: spy(), warn: spy()};
    player = new Player(new Context({
      logger,
      port: 8080,
      mpdHost: 'localhost',
      mpdPort: 6600,
      'instance:AlbumDB': {
        getAlbum: () => Album.fromJson('foo', {
          name: 'Foo',
          discs: [{
            path: '01',
            tracks: [{
              path: '01.ogg',
              title: 'title-1-1',
              length: 100
            }, {
              path: '02.ogg',
              title: 'title-1-2',
              length: 200
            }]
          }, {
            path: '02',
            tracks: [{
              path: '01.ogg',
              title: 'title-2-1',
              length: 300
            }, {
              path: '02.ogg',
              title: 'title-2-2',
              length: 400
            }]
          }]
        })
      }
    }));
    mpdClient = player._mpdClient = {
      sendCommand: stub(),
      sendCommands: stub()
    };
  });

  afterEach(restore);

  describe('status', function() {

    it('calls status and returns result', function() {
      mpdClient.sendCommand.callsArgWith(1, null, 'volume: 100\nstate: stop\n');
      return player.status().then(result => {
        expect(mpdClient.sendCommand).to.have.been.calledWith('status');
        expect(result).to.eql({volume: '100', state: 'stop'});
      });
    });

  });

  describe('play', function() {

    it('calls play and returns null', function() {
      mpdClient.sendCommand.callsArgWith(1, null, '');
      return player.play().then(result => {
        expect(mpdClient.sendCommand).to.have.been.calledWith('play 0');
        expect(result).to.be.null;
      });
    });

    it('calls play with position', function() {
      mpdClient.sendCommand.callsArgWith(1, null, '');
      return player.play(3).then(result => {
        expect(mpdClient.sendCommand).to.have.been.calledWith('play 3');
        expect(result).to.be.null;
      });
    });

  });

  describe('stop', function() {

    it('calls stop and returns null', function() {
      mpdClient.sendCommand.callsArgWith(1, null, '');
      return player.stop().then(result => {
        expect(mpdClient.sendCommand).to.have.been.calledWith('stop');
        expect(result).to.be.null;
      });
    });

  });

  describe('append', function() {

    it('calls add commands, play, and returns null', function() {
      mpdClient.sendCommands.callsArgWith(1, null, '');
      return player.append(['foo.mp3', 'bar.mp3']).then(result => {
        expect(mpdClient.sendCommands).to.have.been.calledWith(['add "foo.mp3"', 'add "bar.mp3"', 'play']);
        expect(result).to.be.null;
      });
    });

  });

  describe('replace', function() {

    it('calls clear, add commands, play, and returns null', function() {
      mpdClient.sendCommands.callsArgWith(1, null, '');
      return player.replace(['foo.mp3', 'bar.mp3']).then(result => {
        expect(mpdClient.sendCommands).to.have.been.calledWith(['clear', 'add "foo.mp3"', 'add "bar.mp3"', 'play']);
        expect(result).to.be.null;
      });
    });

    it('calls load for playlists', function() {
      mpdClient.sendCommands.callsArgWith(1, null, '');
      return player.append(['foo.m3u']).then(() => {
        expect(mpdClient.sendCommands).to.have.been.calledWith(['load "foo.m3u"', 'play']);
      });
    });

  });

  describe('remove', function() {

    it('calls remove with position', function() {
      mpdClient.sendCommand.callsArgWith(1, null, '');
      return player.remove(3).then(result => {
        expect(mpdClient.sendCommand).to.have.been.calledWith('delete 3');
        expect(result).to.be.null;
      });
    });

  });

  describe('playlist', function() {

    it('calls playlistinfo', function() {
      mpdClient.sendCommand.callsArgWith(1, null, EXAMPLE_PLAYLIST_RESULT);
      return player.playlist().then(result => {
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
    });

  });

});
