import {expect, stub, restore} from '../test';

import Player from '../../src/lib/Player';

const EXAMPLE_PLAYLIST_RESULT = `
file: http://example.org/01.ogg
Pos: 1
Id: 23
file: http://example.org/02.ogg
Pos: 2
Id: 24
file: http://example.org/03.ogg
Pos: 3
Id: 25`;

describe('player', function() {

  let player, mpdClient;

  beforeEach(function() {
    player = new Player();
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
        expect(mpdClient.sendCommand).to.have.been.calledWith('play');
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

  describe('playlist', function() {

    it('calls playlistinfo', function() {
      mpdClient.sendCommand.callsArgWith(1, null, EXAMPLE_PLAYLIST_RESULT);
      return player.playlist().then(result => {
        expect(mpdClient.sendCommand).to.have.been.calledWith('playlistinfo');
        expect(result).to.eql([
          {
            file: 'http://example.org/01.ogg',
            Pos: '1',
            Id: '23'
          },
          {
            file: 'http://example.org/02.ogg',
            Pos: '2',
            Id: '24'
          },
          {
            file: 'http://example.org/03.ogg',
            Id: '25',
            Pos: '3'
          }
        ]);
      });
    });

  });

});
