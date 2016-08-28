import {expect} from 'chai';
import config from '../../src/lib/config';

describe('config', function() {

  describe('get', function() {

    it('returns existing values', function() {
      expect(config.get('port')).to.be.a('number');
      expect(config.get('port')).to.be.within(8000, 20000);
    });

    it('returns undefined for non-existing values', function() {
      expect(config.get('not-existing')).not.to.be.defined;
    });

  });

});
