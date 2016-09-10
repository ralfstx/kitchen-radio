import {expect, tmpdir, copy, spy, restore} from '../test';
import {Album} from '../../src/lib/album-types';
import Context from '../../src/lib/Context';
import AlbumDB from '../../src/lib/AlbumDB';
import {statSync, unlinkSync} from 'fs';
import {join} from 'path';

describe('AlbumDB', function() {

  let db, albumsDir;

  beforeEach(function() {
    let tmp = tmpdir();
    albumsDir = join(tmp, 'albums');
    copy(join(__dirname, 'files', 'albums'), albumsDir);
    let logger = {info: spy(), warn: spy()};
    db = new AlbumDB(new Context({logger, albumsDir}));
  });

  afterEach(restore);

  it('is initially empty', function() {
    expect(db.getAlbums()).to.eql([]);
  });

  describe('update', function() {

    beforeEach(function() {
      return db.update();
    });

    it('fills db with albums', function() {
      expect(db.getAlbums().length).to.be.above(1);
    });

    it('does not append albums to existing when called twice', function() {
      let origLength = db.getAlbums().length;
      return db.update().then(() => {
        expect(db.getAlbums().length).to.equal(origLength);
      });
    });

  });

  describe('getAlbum', function() {

    beforeEach(function() {
      return db.update();
    });

    it('returns requested album', function() {
      expect(db.getAlbum('animals')).to.be.instanceof(Album);
      expect(db.getAlbum('animals').artist).to.equal('Pink Floyd');
    });

    it('returns null when album not found', function() {
      expect(db.getAlbum('missing')).to.be.null;
    });

  });

  describe('getAlbums', function() {

    beforeEach(function() {
      return db.update();
    });

    it('returns alls albums', function() {
      expect(db.getAlbums().map(album => album.path))
        .to.contain('animals')
        .to.contain('bluetrain');
    });

    it('returns albums sorted by name', function() {
      expect(db.getAlbums().map(album => album.name)).to.eql([
        'John Coltrane - Blue Train',
        'Pink Floyd - Animals'
      ]);
    });

  });

  describe('search', function() {

    beforeEach(function() {
      return db.update();
    });

    it('returns matching albums', function() {
      expect(db.search(['colt'])).to.eql([{album: db.getAlbum('bluetrain'), tracks: []}]);
    });

    it('returns matching tracks', function() {
      expect(db.search(['pig', 'wing'])).to.eql([{
        album: db.getAlbum('animals'),
        tracks: [db.getAlbum('animals').tracks[0], db.getAlbum('animals').tracks[4]]
      }]);
    });

    it('respects limit', function() {
      expect(db.search(['']).length).to.be.above(1);
      expect(db.search([''], 1).length).to.equal(1);
    });

  });

  describe('updateImages', function() {

    beforeEach(function() {
      return db.update();
    });

    it('reports missing cover images', function() {
      unlinkSync(join(albumsDir, 'animals', 'cover.jpg'));
      return db.updateImages(albumsDir).then(results => {
        expect(results.missing).to.contain(join(albumsDir, 'animals', 'cover.jpg'));
      });
    });

    it('creates missing scaled images', function() {
      return db.updateImages(albumsDir).then(() => {
        statSync(join(albumsDir, 'animals', 'cover-100.jpg'));
        statSync(join(albumsDir, 'animals', 'cover-250.jpg'));
      });
    });

    it('reports written scaled images', function() {
      return db.updateImages(albumsDir).then(results => {
        expect(results.written).to.contain(join(albumsDir, 'animals', 'cover-100.jpg'));
        expect(results.written).to.contain(join(albumsDir, 'animals', 'cover-250.jpg'));
      });
    });

    it('does not re-create existing scaled images', function() {
      return db.updateImages().then(() => db.updateImages()).then(results => {
        expect(results.written).to.eql([]);
      });
    });

  });

});
