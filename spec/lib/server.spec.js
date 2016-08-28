import {expect} from 'chai';
import {stub} from 'sinon';
import fetch from 'node-fetch';

import config from '../../src/lib/config';
import logger from '../../src/lib/logger';
import * as server from '../../src/lib/server';

describe('server', function() {

  let port = config.get('port');
  const PREFIX = 'http://localhost:' + port;

  beforeEach(function() {
    stub(logger, 'info');
    stub(logger, 'debug');
    server.clearHandlers();
  });

  afterEach(function() {
    return server.stop().then(() => {
      server.clearHandlers();
      logger.info.restore();
      logger.debug.restore();
    });
  });

  describe('start', function() {

    it('returns true when started', function() {
      return server.start()
        .then(result => expect(result).to.equal(true));
    });

    it('returns false when already running', function() {
      return server.start()
        .then(() => server.start())
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
        'foo': (request, response) => server.writeJson(response, 23)
      });
      return server.start();
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
