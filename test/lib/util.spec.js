import {expect} from '../test';

import {readProps, toJson} from '../../src/lib/util';

describe('util', function() {

  describe('readProps', function() {

    it('extracts properties', function() {
      expect(readProps('foo: 23')).to.eql({foo: '23'});
      expect(readProps('foo: 23\nbar: 42')).to.eql({foo: '23', bar: '42'});
    });

    it('ignores empty lines', function() {
      expect(readProps('\nfoo: 23\n\nbar: 42\n\n')).to.eql({foo: '23', bar: '42'});
    });

    it('ignores commented lines', function() {
      expect(readProps('\n# comment\nfoo: 23\n  # indented comment\nbar: 42')).to.eql({foo: '23', bar: '42'});
    });

    it('trims surrounding whitespace', function() {
      expect(readProps('  foo  :  23  ')).to.eql({foo: '23'});
      expect(readProps('\tfoo\t:\t23\t')).to.eql({foo: '23'});
    });

    it('uses callback when provided', function() {
      let callback = (key, value, props) => props[key.toUpperCase()] = value;
      expect(readProps('foo: 23\nbar: 42', callback)).to.eql({FOO: '23', BAR: '42'});
    });

    it('returns empty object when called with empty input', function() {
      expect(readProps('')).to.eql({});
    });

    it('returns empty object when called without argument', function() {
      expect(readProps()).to.eql({});
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

    it('returns empty string without argument', function() {
      expect(toJson()).to.equal('');
    });

    it('fails with circular structure', function() {
      let obj = {};
      obj.ref = obj;
      expect(() => toJson(obj)).to.throw(TypeError, /circular.*JSON/);
    });

  });

});
