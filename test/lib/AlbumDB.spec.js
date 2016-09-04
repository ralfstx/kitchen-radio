import {expect, tmpdir, copy, stub, restore} from '../test';
import logger from '../../src/lib/logger';
import {Album} from '../../src/lib/album-types';
import AlbumDB from '../../src/lib/AlbumDB';
import {statSync, unlinkSync} from 'fs';
import {join} from 'path';

describe('AlbumDB', function() {

  let db, albumsDir;

  beforeEach(function() {
    stub(logger, 'info');
    stub(logger, 'warn');
    let tmp = tmpdir();
    albumsDir = join(tmp, 'albums');
    copy(join(__dirname, 'files', 'albums'), albumsDir);
    db = new AlbumDB(albumsDir);
  });

  afterEach(restore);

  it('is initially empty', function() {
    expect(db.getIndex()).to.eql([]);
  });

  describe('update', function() {

    beforeEach(function() {
      return db.update();
    });

    it('fills db with albums', function() {
      expect(db.getIndex().length).to.be.above(1);
      expect(db.getIndex()[0]).to.contain.all.keys(['path', 'name']);
    });

    it('does not append albums to existing when called twice', function() {
      let origLength = db.getIndex().length;
      return db.update().then(() => {
        expect(db.getIndex().length).to.equal(origLength);
      });
    });

  });

  describe('getAlbum', function() {

    beforeEach(function() {
      return db.update();
    });

    it('returns album index data', function() {
      expect(db.getAlbum('animals')).to.be.instanceof(Album);
      expect(db.getAlbum('animals').artist).to.equal('Pink Floyd');
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
