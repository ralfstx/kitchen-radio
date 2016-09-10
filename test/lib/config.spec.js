import {expect} from '../test';
import config from '../../src/lib/config';

describe('config', function() {

  describe('get', function() {

    it('returns existing values', function() {
      expect(config.get('port')).to.be.a('number');
      expect(config.get('port')).to.be.within(8000, 20000);
    });

    it('returns default for non-existing values', function() {
      expect(config.get('not-existing', 'default')).to.equal('default');
    });

    it('throws for non-existing values and no default', function() {
      expect(() => config.get('not-existing')).to.throw();
    });

  });

  describe('set', function() {

    it('sets new value', function() {
      config.set('foo', 23);
      expect(config.get('foo')).to.equal(23);
    });

    it('replaces existing value', function() {
      config.set('foo', 23);
      config.set('foo', 42);
      expect(config.get('foo')).to.equal(42);
    });

  });

});
