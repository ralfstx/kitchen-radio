let Config = require('../../src/lib/config');

describe('config', function() {

  describe('get', function() {

    it('returns existing values', function() {
      expect(Config.get('port')).toBe(9878);
    });

    it('returns undefined for non-existing values', function() {
      expect(Config.get('not-existing')).not.toBeDefined();
    });

  });

});
