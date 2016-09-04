import {expect, stub, restore} from '../test';

import Player from '../../src/lib/Player';

describe('player', function() {

  let player;

  beforeEach(function() {
    player = new Player();
  });

  afterEach(restore);

  describe('status', function() {

    it('returns result', function() {
      stub(player, '_sendCommand', () => Promise.resolve('volume: 100\nstate: stop\n'));
      return player.status()
        .then(result => expect(result).to.eql({volume: '100', state: 'stop'}));
    });

  });

});
