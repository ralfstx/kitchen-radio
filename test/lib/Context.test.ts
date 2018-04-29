import { Context } from '../../src/lib/Context';
import { expect } from '../test';

describe('Context', function() {

  let context: Context;

  describe('constructor', function() {

    beforeEach(function() {
      context = new Context({logger: 23, config: 42});
    });

    it('creates properties', function() {
      expect(context.logger).to.equal(23);
      expect(context.config).to.equal(42);
    });

    it('creates enumerable properties', function() {
      expect(Object.keys(context)).to.include('logger');
    });

  });

});
