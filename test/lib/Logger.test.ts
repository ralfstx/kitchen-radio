import { Logger } from '../../src/lib/Logger';
import { expect, restore, tmpdir } from '../test';

describe('Logger', function() {

  let log: any[];
  let tmpDir: string;
  let logger: any;

  beforeEach(async function() {
    tmpDir = tmpdir();
    log = [];
    logger = Logger.createForStreams('debug', [{
      type: 'raw',
      stream: {write: (rec: any) => log.push(rec)}
    }]);
  });

  afterEach(restore);

  describe('create', function() {

    it('throws on invalid logLevel config value', function() {
      let config: any = {logLevel: 'foo', logDir: tmpDir};

      let call = () => Logger.create(config);

      expect(call).to.throw('foo');
    });

    it('creates a logger instance', function() {
      let config: any = {logLevel: 'error', logDir: tmpDir};

      logger = Logger.create(config);

      expect(logger).to.be.instanceOf(Logger);
    });

  });

  ['debug', 'info', 'warn', 'error'].forEach(level => describe(level, () => {

    it('logs plain message', async function() {
      logger[level]('foo');

      expect(log[0].msg).to.equal('foo');
    });

    it('logs errors', async function() {
      let err = new Error('boom');

      logger.error('foo', {err});

      expect(log[0].err.message).to.equal('boom');
    });

  }));

});
