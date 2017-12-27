import {expect} from '../test';
import {createAlbumFromIndex} from '../../src/lib/AlbumIndex';

describe('AlbumIndex', function() {

  describe('createAlbumFromIndex', function() {

    it('creates album with id', function() {
      let album = createAlbumFromIndex('foo', 'foo/bar', {});

      expect(album.id).to.equal('foo');
    });

    it('creates discs and tracks', function() {
      let album = createAlbumFromIndex('id', 'foo', {
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
      expect(album.tracks[0].path).to.equal('foo/01/01.ogg');
    });

    it('creates disc for tracks on root level', function() {
      let album = createAlbumFromIndex('id', 'foo', {
        tracks: [{
          path: '01.ogg'
        }, {
          path: '02.ogg'
        }]
      });

      expect(album.discs.length).to.equal(1);
      expect(album.tracks.length).to.equal(2);
      expect(album.tracks[0].path).to.equal('foo/01.ogg');
    });

  });

});
