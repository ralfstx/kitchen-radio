let expect = require('chai').expect;
let stub = require('sinon').stub;
let fetch = require('node-fetch');

let Logger = require('../../src/lib/logger');
let Config = require('../../src/lib/config');
let Server = require('../../src/lib/server');

describe('server', function() {

  let port = Config.get('port');
  const PREFIX = 'http://localhost:' + port;

  beforeEach(function() {
    stub(Logger, 'info');
    stub(Logger, 'debug');
    Server.clearHandlers();
  });

  afterEach(function() {
    return Server.stop().then(() => {
      Server.clearHandlers();
      Logger.info.restore();
      Logger.debug.restore();
    });
  });

  describe('start', function() {

    it('returns true when started', function() {
      return Server.start()
        .then(result => expect(result).to.equal(true));
    });

    it('returns false when already running', function() {
      return Server.start()
        .then(() => Server.start())
        .then(result => expect(result).to.be.false);
    });

  });

  describe('addHandler', function() {

    it('ignores non-objects', function() {
      expect(() => {
        Server.addHandlers();
        Server.addHandlers(23);
        Server.addHandlers(false);
      }).not.to.throw();
    });

  });

  describe("added handler for 'foo'", function() {

    beforeEach(function() {
      Server.addHandlers({
        'foo': (request, response) => Server.writeJson(response, 23)
      });
      return Server.start();
    });

    it("receives '/foo'", function() {
      return fetch(PREFIX + '/foo')
        .then(res => res.json())
        .then(json => expect(json).to.equal(23));
    });

    it("receives '/foo/'", function() {
      return fetch(PREFIX + '/foo/')
        .then(res => res.json())
        .then(json => expect(json).to.equal(23));
    });

    it("receives '/foo/bar'", function() {
      return fetch(PREFIX + '/foo/bar')
        .then(res => res.json())
        .then(json => expect(json).to.equal(23));
    });

    it('without matching handler returns 404', function() {
      return fetch(PREFIX + '/bar')
        .then(res => expect(res.status).to.equal(404));
    });

  });

});
