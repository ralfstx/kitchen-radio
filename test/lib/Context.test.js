import {expect} from '../test';
import Context from '../../src/lib/Context';

describe('Context', function() {

  let context;

  describe('constructor', function() {

    beforeEach(function() {
      context = new Context({foo: 23, bar: 42});
    });

    it('creates properties', function() {
      expect(context.foo).to.equal(23);
      expect(context.bar).to.equal(42);
    });

    it('creates read-only properties', function() {
      expect(() => context.foo = 42).to.throw();
    });

    it('creates enumerable properties', function() {
      expect(Object.keys(context)).to.include('foo');
    });

  });

  describe('instance', function() {

    beforeEach(function() {
      context = new Context({});
    });

    describe('set', function() {

      it('creates new property', function() {
        context.set('foo', 23);
        expect(context.foo).to.equal(23);
      });

      it('creates read-only property', function() {
        context.set('foo', 23);
        expect(() => context.foo = 42).to.throw();
      });

      it('creates enumerable property', function() {
        context.set('foo', 23);
        expect(Object.keys(context)).to.include('foo');
      });

    });

  });

});
