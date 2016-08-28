let expect = require('chai').expect;

let util = require('../../src/lib/util');

describe('util', function() {

  describe('readProps', function() {

    it('extracts properties', function() {
      expect(util.readProps('foo: 23')).to.eql({foo: '23'});
      expect(util.readProps('foo: 23\nbar: 42')).to.eql({foo: '23', bar: '42'});
    });

    it('ignores empty lines', function() {
      expect(util.readProps('\nfoo: 23\n\nbar: 42\n\n')).to.eql({foo: '23', bar: '42'});
    });

    it('ignores commented lines', function() {
      expect(util.readProps('\n# comment\nfoo: 23\n  # indented comment\nbar: 42')).to.eql({foo: '23', bar: '42'});
    });

    it('trims surrounding whitespace', function() {
      expect(util.readProps('  foo  :  23  ')).to.eql({foo: '23'});
      expect(util.readProps('\tfoo\t:\t23\t')).to.eql({foo: '23'});
    });

    it('returns empty object for empty input', function() {
      expect(util.readProps('')).to.eql({});
    });

    it('returns empty object without argument', function() {
      expect(util.readProps()).to.eql({});
    });

  });

  describe('toJson', function() {

    it('indents by one space', function() {
      expect(util.toJson({foo: 23})).to.equal('{\n "foo": 23\n}');
      expect(util.toJson({foo: [23, 42]})).to.equal('{\n "foo": [\n  23,\n  42\n ]\n}');
    });

    it('does not add spaces to empty object and arrays', function() {
      expect(util.toJson({})).to.equal('{}');
      expect(util.toJson([])).to.equal('[]');
    });

    it('converts primitives to JSON', function() {
      expect(util.toJson(true)).to.equal('true');
      expect(util.toJson(23)).to.equal('23');
    });

    it('returns empty string without argument', function() {
      expect(util.toJson()).to.equal('');
    });

    it('fails with circular structure', function() {
      let obj = {};
      obj.ref = obj;
      expect(() => util.toJson(obj)).to.throw(TypeError, /circular.*JSON/);
    });

  });

});
