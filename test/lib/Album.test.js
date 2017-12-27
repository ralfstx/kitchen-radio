import {expect} from '../test';
import Album from '../../src/lib/Album';
import Track from '../../src/lib/Track';
import TrackList from '../../src/lib/TrackList';

describe('Album', function() {

  /** @type {Album} */
  let album;

  beforeEach(function() {
    album = new Album('id');
  });

  describe('id', function() {

    it('returns the id', function() {
      expect(album.id).to.equal('id');
    });

  });

  describe('artist', function() {

    it('returns empty string by default', function() {
      expect(album.artist).to.equal('');
    });

    it('returns artist from metadata', function() {
      album = new Album('id', [], {artist: 'Pink Floyd'});

      expect(album.artist).to.equal('Pink Floyd');
    });

  });

  describe('title', function() {

    it('returns empty string by default', function() {
      expect(album.title).to.equal('');
    });

    it('returns title from metadata', function() {
      album = new Album('id', [], {title: 'Animals'});

      expect(album.title).to.equal('Animals');
    });

  });

  describe('name', function() {

    it('returns empty string by default', function() {
      expect(album.name).to.equal('');
    });

    it('returns name from metadata', function() {
      album = new Album('id', [], {name: 'Pink Floyd - Animals'});

      expect(album.name).to.equal('Pink Floyd - Animals');
    });

    it('creates name from title', function() {
      album = new Album('id', [], {title: 'Animals'});

      expect(album.name).to.equal('Animals');
    });

    it('creates name from artist and title', function() {
      album = new Album('id', [], {artist: 'Pink Floyd', title: 'Animals'});

      expect(album.name).to.equal('Pink Floyd - Animals');
    });

  });

  describe('discs', function() {

    it('returns [] by default', function() {
      expect(album.discs).to.deep.equal([]);
    });

    it('contains track list', function() {
      let trackList = new TrackList([
        new Track('02.ogg'),
        new Track('01.ogg')
      ]);

      album = new Album('id', [trackList]);

      expect(album.discs).to.deep.equal([trackList]);
    });

  });

  describe('tracks', function() {

    it('returns [] by default', function() {
      expect(album.tracks).to.deep.equal([]);
    });

    it('contains tracks from all discs', function() {
      let tracks = [new Track('1'), new Track('2'), new Track('3')];
      let trackLists = [new TrackList([tracks[0], tracks[1]]), new TrackList([tracks[2]])];

      album = new Album('id', trackLists);

      expect(album.tracks).to.deep.equal(tracks);
    });

  });

});
