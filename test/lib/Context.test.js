import {expect} from '../test';
import Context from '../../src/lib/Context';

describe('Context', function() {

  let context;

  beforeEach(function() {
    context = new Context({
      foo: 23
    });
  });

  describe('get', function() {

    it('returns existing values', function() {
      expect(context.get('foo')).to.equal(23);
    });

    it('returns default for non-existing values', function() {
      expect(context.get('not-existing', 'default')).to.equal('default');
    });

    it('throws for non-existing values and no default', function() {
      expect(() => context.get('not-existing')).to.throw();
    });

  });

  describe('set', function() {

    it('sets new value', function() {
      context.set('bar', 23);
      expect(context.get('bar')).to.equal(23);
    });

    it('replaces existing value', function() {
      context.set('foo', 42);
      expect(context.get('foo')).to.equal(42);
    });

  });

});
