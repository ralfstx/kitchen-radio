import 'mocha';
import {expect} from 'chai';
import Track from '../../src/lib/Track';
import TrackList from '../../src/lib/TrackList';

describe('TrackList', function() {

  let track;
  let trackList;

  beforeEach(function() {
    track = new Track('foo');
    trackList = new TrackList([]);
  });

  describe('name', function() {

    it('returns empty string by default', function() {
      expect(trackList.name).to.be.empty;
    });

    it('returns name from metadata', function() {
      expect(new TrackList([], {name: 'foo'}).name).to.deep.equal('foo');
    });

  });

  describe('tracks', function() {

    it('returns empty list by default', function() {
      expect(trackList.tracks).to.be.empty;
    });

    it('accepts tracks', function() {
      expect(new TrackList([track, track]).tracks).to.deep.equal([track, track]);
    });

  });

});
