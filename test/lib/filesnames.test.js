import {expect} from '../test';
import {encodeAscii} from '../../src/lib/filenames';

describe('filenames', function() {

  it('keeps simple lowercase strings', function() {
    expect(encodeAscii('foo')).to.equal('foo');
  });

  it('keeps dashes', function() {
    expect(encodeAscii('foo-bar')).to.equal('foo-bar');
    expect(encodeAscii('Rolling Stones - Rewind')).to.equal('rolling-stones-rewind');
  });

  it('replaces diacritics dashes', function() {
    expect(encodeAscii('daß')).to.equal('dass');
    expect(encodeAscii('Smørrebrød')).to.equal('smorrebrod');
    expect(encodeAscii('Herbert Grönemeyer - Ö')).to.equal('herbert-gronemeyer-o');
  });

  it('translates all "&" to "and"', function() {
    expect(encodeAscii('The K&D Sessions')).to.equal('the-k-and-d-sessions');
    expect(encodeAscii('A & B & C')).to.equal('a-and-b-and-c');
  });

  it('translates all "+" to "and"', function() {
    expect(encodeAscii('Genius + Soul')).to.equal('genius-and-soul');
    expect(encodeAscii('A + B + C')).to.equal('a-and-b-and-c');
  });

  it('eliminates leading and trailing whitespace', function() {
    expect(encodeAscii(' foo bar ')).to.equal('foo-bar');
    expect(encodeAscii('\tfoo\tbar\t')).to.equal('foo-bar');
    expect(encodeAscii('& you')).to.equal('and-you');
  });

});
