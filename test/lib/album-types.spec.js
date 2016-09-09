import {expect} from '../test';
import {Track, TrackList, Album} from '../../src/lib/album-types';

describe('media', function() {

  let album, disc, track;

  beforeEach(function() {
    album = new Album('test');
    disc = new TrackList(album, 'disc1');
    track = new Track(disc, '01.ogg');
  });

  describe('Track', function() {

    describe('ctor', function() {

      it('fails without path', function() {
        expect(() => {
          new Track(disc);
        }).to.throw(Error, 'path missing');
      });

      it('succeeds without parent', function() {
        expect(() => {
          new Track(null, '01.ogg');
        }).not.to.throw();
      });

      it('succeeds with minimal data', function() {
        expect(() => {
          new Track(disc, '01.ogg');
        }).not.to.throw();
      });

      it('adds to parent', function() {
        expect(disc.tracks).to.contain(track);
      });

    });

    describe('album property', function() {

      it('returns album', function() {
        expect(track.album).to.equal(album);
      });

      it('is read-only', function() {
        expect(() => {
          track.album = null;
        }).to.throw(TypeError, /cannot set/i);
      });

    });

    describe('number property', function() {

      it('returns number', function() {
        expect(track.number).to.equal(1);
      });

      it('returns number > 1', function() {
        track = new Track(disc, '02.ogg');
        expect(track.number).to.equal(2);
      });

      it('is read-only', function() {
        expect(() => {
          track.number = 0;
        }).to.throw(TypeError, /cannot set/i);
      });

    });

    describe('path and abspath', function() {

      it('work without parent', function() {
        track = new Track(null, '01.ogg');
        expect(track.path).to.equal('01.ogg');
        expect(track.location).to.equal('01.ogg');
      });

      it('work on nested tracks', function() {
        expect(track.path).to.equal('01.ogg');
        expect(track.location).to.equal('test/disc1/01.ogg');
      });

    });

    describe('artist', function() {

      it('is taken from track if present', function() {
        track.data = {artist: 'Pink Floyd'};
        expect(track.artist).to.equal('Pink Floyd');
      });

      it('is derived from album if not present', function() {
        album.data = {artist: 'Pink Floyd'};

        expect(track.artist).to.equal('Pink Floyd');
      });

      it('returns null if missing in track and album', function() {
        expect(track.artist).to.be.null;
      });

      it('returns null if missing in track and there is no album', function() {
        track = new Track(null, '01.ogg');

        expect(track.artist).to.be.null;
      });

    });

    describe('data', function() {

      it('is empty by default', function() {
        expect(track.data).to.eql({});
      });

      it('can be get and set', function() {
        track.data = {artist: 'Jack Who', title: 'Who is it?'};
        expect(track.data).to.eql({artist: 'Jack Who', title: 'Who is it?'});
      });

      it('filters unsupported attributes', function() {
        track.data = {artist: 'Jack Who', foo: 'bar'};
        expect(track.data).to.eql({artist: 'Jack Who'});
      });

    });

    describe('tags', function() {

      it('empty if no data found', function() {
        track = new Track(null, '01.ogg');

        expect(track.tags()).to.eql({
        });
      });

      it('contains track data if no album', function() {
        track.data = {title: 'Money', artist: 'Pink Floyd', length: 23};

        expect(track.tags()).to.eql({
          artist: 'Pink Floyd',
          title: 'Money',
          length: 23
        });
      });

      it('contains tracknumber if multiple tracks on disc', function() {
        disc = new TrackList(null, 'disc');
        track = new Track(disc, '01.ogg');
        new Track(disc, '02.ogg');

        expect(track.tags().totaltracks).to.equal(2);
        expect(track.tags().tracknumber).to.equal(1);
      });

      it('skips tracknumber if single track', function() {
        expect(track.tags().totaltracks).to.be.undefined;
        expect(track.tags().tracknumber).to.be.undefined;
      });

      it('contains discnumber if multiple discs', function() {
        new TrackList(album, 'disc2');
        track = new Track(disc, '02.ogg');

        expect(track.tags().totaldiscs).to.equal(2);
        expect(track.tags().discnumber).to.equal(1);
      });

      it('skips discnumber if single disc', function() {
        expect(track.tags().totaldiscs).to.be.undefined;
        expect(track.tags().discnumber).to.be.undefined;
      });

      it('contains albumartist if different from track artist', function() {
        album.data = {name: 'Test Album', title: 'Animals', artist: 'Pink Floyd'};
        track.data = {title: 'Money', artist: 'Jesus Moriarty'};
        let disc2 = new TrackList(album, 'disc');
        new Track(disc, '02.ogg');
        new Track(disc2, '01.ogg');

        expect(track.tags().albumartist).to.equal('Pink Floyd');
        expect(track.tags().artist).to.equal('Jesus Moriarty');
      });

    });

  });

  describe('TrackList', function() {

    describe('ctor', function() {

      it('fails without path', function() {
        expect(() => {
          new TrackList(album);
        }).to.throw(Error, 'path missing');
      });

      it('succeeds without parent', function() {
        expect(() => {
          new TrackList(null, '01');
        }).not.to.throw();
      });

      it('succeeds with minimal data', function() {
        expect(() => {
          new TrackList(null, '01');
        }).not.to.throw();
      });

      it('adds to parent', function() {
        expect(disc.tracks).to.contain(track);
      });

    });

    describe('path and abspath', function() {

      it('works without parent', function() {
        disc = new TrackList(null, 'disc1');
        expect(disc.path).to.equal('disc1');
        expect(disc.location).to.equal('disc1');
      });

      it('works with parent', function() {
        expect(disc.path).to.equal('disc1');
        expect(disc.location).to.equal('test/disc1');
      });

    });

    describe('data', function() {

      it('is empty by default', function() {
        expect(disc.data).to.eql({});
      });

      it('can be get and set', function() {
        disc.data = {artist: 'Jack Who', title: 'Who the f*#!?'};
        expect(disc.data).to.eql({artist: 'Jack Who', title: 'Who the f*#!?'});
      });

      it('filters unsupported attributes', function() {
        disc.data = {artist: 'Jack Who', foo: 'bar'};
        expect(disc.data).to.eql({artist: 'Jack Who'});
      });

    });

    describe('album', function() {

      it('returns the album if present', function() {
        let tracklist = new TrackList(album, '01');

        expect(tracklist.album).to.equal(album);
      });

      it('returns null if there ain\'t no album', function() {
        let tracklist = new TrackList(null, '01');

        expect(tracklist.album).to.equal(null);
      });

    });

  });

  describe('Album', function() {

    describe('ctor', function() {

      it('fails without path', function() {
        expect(() => {
          new Album(null, {name: 'Foo - Bar'});
        }).to.throw(Error, 'path missing');
      });

    });

    describe('path and abspath', function() {

      it('return correct paths', function() {
        expect(album.path).to.equal('test');
        expect(album.location).to.equal('test');
      });

    });

    describe('data', function() {

      it('is empty by default', function() {
        expect(album.data).to.eql({});
      });

      it('can be get and set', function() {
        album.data = {artist: 'Jack Who', title: 'Who the f*#!?'};
        expect(album.data).to.eql({artist: 'Jack Who', title: 'Who the f*#!?'});
      });

      it('filters unsupported attributes', function() {
        album.data = {artist: 'Jack Who', foo: 'bar'};
        expect(album.data).to.eql({artist: 'Jack Who'});
      });

    });

    describe('album', function() {

      it('returns itself', function() {
        expect(album.album).to.equal(album);
      });

    });

    describe('artist', function() {

      it('returns artist from data', function() {
        album.data = {artist: 'Pink Floyd'};
        expect(album.artist).to.equal('Pink Floyd');
      });

      it('returns null if missing in data', function() {
        expect(album.artist).to.be.null;
      });

    });

    describe('title', function() {

      it('returns title from data', function() {
        album.data = {name: 'Test Album', title: 'Animals'};
        expect(album.title).to.equal('Animals');
      });

      it('returns null if missing in data', function() {
        expect(album.title).to.be.null;
      });

    });

    describe('tracks', function() {

      it('contains tracks from all discs', function() {
        let disc2 = new TrackList(album, 'disc2');
        new Track(disc, '02.ogg');
        new Track(disc2, '01.ogg');
        let tracks = album.tracks;

        expect(tracks).not.to.equal(album.tracks);
        expect(tracks.map(track => track.location)).to.eql(['test/disc1/01.ogg',
                                                            'test/disc1/02.ogg',
                                                            'test/disc2/01.ogg']);
      });

      it('returns [] when there ain\'t no tracks', function() {
        album = new Album('foo', {name: 'Foo'});

        expect(album.tracks).to.eql([]);
      });

    });

    describe('toJson', function() {

      it('returns JSON equivalent to input', function() {
        album.data = {name: 'Test Album', artist: 'Jimmy the Fish', title: 'Swimming'};
        let disc2 = new TrackList(album, 'disc2');
        new Track(disc, '02.ogg').data = {title: 'Part Two'};
        new Track(disc2, '01.ogg').data = {title: 'The End'};
        let json = album.toJson();

        expect(JSON.parse(json)).to.eql({
          name: 'Test Album',
          artist: 'Jimmy the Fish',
          title: 'Swimming',
          discs: [{
            tracks: [{
            }, {
              title: 'Part Two'
            }]
          }, {
            tracks: [{
              title: 'The End'
            }]
          }]
        });
      });

      it('skips unknown elements', function() {
        album = Album.fromJson('foo', {
          name: 'Foo',
          foo: 23, // <-- bogus
          tracks: [{
            path: 'bar',
            foo: 42 // <-- bogus
          }]
        });

        let jsonData = JSON.parse(album.toJson());

        expect(jsonData.foo).to.be.undefined;
        expect(jsonData.discs[0].tracks[0].foo).to.be.undefined;
      });

    });

    describe('fromJson', function() {

      it('creates discs and tracks', function() {
        album = Album.fromJson('foo', {
          discs: [{
            path: '01',
            tracks: [{path: '01.ogg'}, {path: '02.ogg'}]
          }, {
            path: '02',
            tracks: [{path: '01.ogg'}, {path: '02.ogg'}]
          }]
        });

        expect(album.discs.length).to.equal(2);
        expect(album.tracks.length).to.equal(4);
        expect(album.tracks[0].location).to.equal('foo/01/01.ogg');
      });

      it('creates disc for tracks on root level', function() {
        album = Album.fromJson('foo', {
          tracks: [{
            path: '01.ogg'
          }, {
            path: '02.ogg'
          }]
        });

        expect(album.discs.length).to.equal(1);
        expect(album.tracks.length).to.equal(2);
        expect(album.tracks[0].location).to.equal('foo/01.ogg');
      });

    });

  });

});
