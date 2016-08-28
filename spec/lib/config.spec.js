let expect = require('chai').expect;
let Config = require('../../src/lib/config');

describe('config', function() {

  describe('get', function() {

    it('returns existing values', function() {
      expect(Config.get('port')).to.be.a('number');
      expect(Config.get('port')).to.be.within(8000, 20000);
    });

    it('returns undefined for non-existing values', function() {
      expect(Config.get('not-existing')).not.to.be.defined;
    });

  });

});
