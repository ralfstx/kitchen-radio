import {statSync, unlinkSync} from 'fs';
import {join} from 'path';
import {expect, tmpdir, copy, spy, restore} from '../test';
import {Album} from '../../src/lib/album-types';
import Context from '../../src/lib/Context';
import AlbumDB from '../../src/lib/AlbumDB';

describe('AlbumDB', function() {

  let db, musicDir;

  beforeEach(function() {
    let tmp = tmpdir();
    musicDir = join(tmp);
    copy(join(__dirname, 'files', 'albums'), join(musicDir, 'albums'));
    let logger = {info: spy(), warn: spy()};
    db = new AlbumDB(new Context({logger, musicDir}));
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

    it('creates ids for albums', function() {
      return db.update().then(() => {
        let album = db.getAlbums()[0];
        expect(album.id).to.match(/^[0-9a-z]{8}$/);
      });
    });

    it('creates unique ids', function() {
      return db.update().then(() => {
        let albums = db.getAlbums();
        expect(albums[0].id).not.to.equal(albums[1].id);
      });
    });

  });

  describe('getAlbum', function() {

    beforeEach(function() {
      return db.update();
    });

    it('returns requested album', function() {
      expect(db.getAlbum('966c69dd')).to.be.instanceof(Album);
      expect(db.getAlbum('966c69dd').artist).to.equal('Pink Floyd');
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
      expect(db.getAlbums().map(album => album.title))
        .to.contain('Animals')
        .to.contain('Blue Train');
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
      expect(db.search(['colt'])).to.eql([{album: db.getAlbum('6ff57aa3'), tracks: []}]);
    });

    it('returns matching tracks', function() {
      expect(db.search(['pig', 'wing'])).to.eql([{
        album: db.getAlbum('966c69dd'),
        tracks: [db.getAlbum('966c69dd').tracks[0], db.getAlbum('966c69dd').tracks[4]]
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
      unlinkSync(join(musicDir, 'albums/animals', 'cover.jpg'));
      return db.updateImages().then(results => {
        expect(results.missing).to.contain(join(musicDir, 'albums/animals', 'cover.jpg'));
      });
    });

    it('creates missing scaled images', function() {
      return db.updateImages(musicDir).then(() => {
        statSync(join(musicDir, 'albums/animals', 'cover-100.jpg'));
        statSync(join(musicDir, 'albums/animals', 'cover-250.jpg'));
      });
    });

    it('reports written scaled images', function() {
      return db.updateImages(musicDir).then(results => {
        expect(results.written).to.contain(join(musicDir, 'albums/animals', 'cover-100.jpg'));
        expect(results.written).to.contain(join(musicDir, 'albums/animals', 'cover-250.jpg'));
      });
    });

    it('does not re-create existing scaled images', function() {
      return db.updateImages().then(() => db.updateImages()).then(results => {
        expect(results.written).to.eql([]);
      });
    });

  });

});
