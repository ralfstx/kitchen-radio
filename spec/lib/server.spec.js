import {expect} from 'chai';
import {stub} from 'sinon';
import fetch from 'node-fetch';

import config from '../../src/lib/config';
import logger from '../../src/lib/logger';
import Server, {writeJson} from '../../src/lib/server';

describe('server', function() {

  const PORT = config.get('port');
  const PREFIX = 'http://localhost:' + PORT;
  let server;

  beforeEach(function() {
    stub(logger, 'info');
    stub(logger, 'debug');
    server = new Server();
  });

  afterEach(function() {
    return server.stop().then(() => {
      logger.info.restore();
      logger.debug.restore();
    });
  });

  describe('start', function() {

    it('returns true when started', function() {
      return server.start(PORT)
        .then(result => expect(result).to.equal(true));
    });

    it('returns false when already running', function() {
      return server.start(PORT)
        .then(() => server.start(PORT))
        .then(result => expect(result).to.be.false);
    });

  });

  describe('addHandler', function() {

    it('ignores non-objects', function() {
      expect(() => {
        server.addHandlers();
        server.addHandlers(23);
        server.addHandlers(false);
      }).not.to.throw();
    });

  });

  describe("added handler for 'foo'", function() {

    beforeEach(function() {
      server.addHandlers({
        'foo': (request, response) => writeJson(response, 23)
      });
      return server.start(PORT);
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
