import 'mocha';
import {expect} from 'chai';
import Track from '../../src/lib/Track';

describe('Track', function() {

  /** @type {Track} */
  let track;

  beforeEach(function() {
    track = new Track('foo');
  });

  describe('constructor', function() {
    it('fails with empty path', function() {
      expect(() => new Track('')).to.throw(Error, 'path missing');
    });
  });

  describe('path', function() {

    it('returns filename without path', function() {
      expect(new Track('foo.mp3').path).to.equal('foo.mp3');
    });

    it('returns filename with path', function() {
      expect(new Track('foo/bar.mp3').path).to.equal('foo/bar.mp3');
    });

    it('normalizes path', function() {
      expect(new Track('foo/bar/../bar.mp3').path).to.equal('foo/bar.mp3');
    });

  });

  describe('length', function() {

    it('returns zero by default', function() {
      expect(track.length).to.equal(0);
    });

    it('accepts positive integer', function() {
      track = new Track('foo', {length: 23});
      expect(track.length).to.equal(23);
    });

    it('clamps negative value', function() {
      track = new Track('foo', {length: -1});
      expect(track.length).to.equal(0);
    });

    it('rounds up non integer values', function() {
      track = new Track('foo', {length: 47.11});
      expect(track.length).to.equal(48);
    });

  });

  describe('artist', function() {

    it('returns `` by default', function() {
      expect(track.artist).to.equal('');
    });

    it('returns artist from metadata', function() {
      track = new Track('foo.mp3', {artist: 'Nirvana'});
      expect(track.artist).to.equal('Nirvana');
    });

  });

  describe('title', function() {

    it('returns `` by default', function() {
      expect(track.title).to.equal('');
    });

    it('returns title from metadata', function() {
      track = new Track('foo.mp3', {title: 'Lithium'});
      expect(track.title).to.equal('Lithium');
    });

  });

});
