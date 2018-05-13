import { pick, promisify, readProps, toJson } from '../../src/lib/util';
import { catchError, expect } from '../test';

describe('util', function() {

  describe('readProps', function() {

    it('extracts properties', function() {
      expect(readProps('foo: 23')).to.deep.equal({foo: '23'});
      expect(readProps('foo: 23\nbar: 42')).to.deep.equal({foo: '23', bar: '42'});
    });

    it('ignores empty lines', function() {
      expect(readProps('\nfoo: 23\n\nbar: 42\n\n')).to.deep.equal({foo: '23', bar: '42'});
    });

    it('ignores commented lines', function() {
      expect(readProps('\n# comment\nfoo: 23\n  # indented comment\nbar: 42'))
          .to.deep.equal({foo: '23', bar: '42'});
    });

    it('trims surrounding whitespace', function() {
      expect(readProps('  foo  :  23  ')).to.deep.equal({foo: '23'});
      expect(readProps('\tfoo\t:\t23\t')).to.deep.equal({foo: '23'});
    });

    it('uses callback when provided', function() {
      let callback = (key: string, value: any, props: any) => props[key.toUpperCase()] = value;
      expect(readProps('foo: 23\nbar: 42', callback)).to.deep.equal({FOO: '23', BAR: '42'});
    });

    it('returns empty object when called with empty input', function() {
      expect(readProps('')).to.deep.equal({});
    });

  });

  describe('toJson', function() {

    it('indents by one space', function() {
      expect(toJson({foo: 23})).to.equal('{\n "foo": 23\n}');
      expect(toJson({foo: [23, 42]})).to.equal('{\n "foo": [\n  23,\n  42\n ]\n}');
    });

    it('does not add spaces to empty object and arrays', function() {
      expect(toJson({})).to.equal('{}');
      expect(toJson([])).to.equal('[]');
    });

    it('converts primitives to JSON', function() {
      expect(toJson(true)).to.equal('true');
      expect(toJson(23)).to.equal('23');
    });

    it('fails with circular structure', function() {
      let obj = {} as any;
      obj.ref = obj;
      expect(() => toJson(obj)).to.throw(TypeError, /circular.*JSON/);
    });

  });

  describe('promisify', function() {

    it('resolves when callback is called', async function() {
      let fn = (n: number, cb: any) => setTimeout(() => cb(null, n + 1), 10);
      let pfn = promisify(fn);

      let res = await pfn(23);
      expect(res).to.equal(24);
    });

    it('rejects when callback is called with error', async function() {
      let fn = (n: number, cb: any) => setTimeout(() => cb('error'), 10);
      let pfn = promisify(fn);

      let err = await catchError(pfn(23));
      expect(err).to.equal('error');
    });

  });

  describe('pick', function() {
    it('accepts an empty object', function() {
      let obj = {};
      let res = pick(obj, []);
      expect(res).to.deep.equal({});
      expect(res).to.not.equal(obj);
    });

    it('accepts empty keys list', function() {
      let obj = {foo: 23, bar: 42};
      let res = pick(obj, []);
      expect(res).to.deep.equal({});
    });

    it('filters unknown keys', function() {
      let obj = {foo: 23, bar: 42, baz: 4711};
      let res = pick(obj, ['foo', 'bar']);
      expect(res).to.deep.equal({foo: 23, bar: 42});
    });
  });

});
