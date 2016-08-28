import {expect} from 'chai';
import {stub} from 'sinon';

import Player from '../../src/lib/player';

describe('player', function() {

  let player;

  beforeEach(function() {
    player = new Player();
  });

  describe('status', function() {

    it('returns true when started', function() {
      stub(player, '_sendCommand', () => Promise.resolve('volume: 100\nstate: stop\n'));
      return player.status()
        .then(result => expect(result).to.eql({volume: '100', state: 'stop'}));
    });

  });

});
