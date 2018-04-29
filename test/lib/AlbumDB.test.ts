import { copy } from 'fs-extra';
import { join } from 'path';
import { Album } from '../../src/lib/Album';
import { AlbumDB } from '../../src/lib/AlbumDB';
import { Context } from '../../src/lib/Context';
import { expect, restore, spy, tmpdir } from '../test';

describe('AlbumDB', function() {

  let albumDB: AlbumDB;
  let musicDir: string;

  beforeEach(async function() {
    musicDir = tmpdir();
    await copy(join(__dirname, 'files', 'albums'), join(musicDir, 'albums'));
    let logger = {info: spy(), warn: spy()};
    let coverDB = {storeAlbumCover: spy()};
    albumDB = new AlbumDB(new Context({logger, coverDB, config: {musicDir}}));
  });

  afterEach(restore);

  it('is initially empty', function() {
    expect(albumDB.getAlbumIds()).to.eql([]);
  });

  describe('update', function() {

    beforeEach(async  function() {
      await albumDB.update();
    });

    it('fills db with albums', function() {
      expect(albumDB.getAlbumIds().length).to.be.above(1);
    });

    it('does not append albums to existing when called twice', async function() {
      let origLength = albumDB.getAlbumIds().length;
      await albumDB.update();
      expect(albumDB.getAlbumIds().length).to.equal(origLength);
    });

    it('creates ids for albums', async function() {
      await albumDB.update();
      let id = albumDB.getAlbumIds()[0];
      expect(id).to.match(/^[0-9a-z]{8}$/);
    });

    it('creates unique ids', async function() {
      await albumDB.update();
      let id1 = albumDB.getAlbumIds()[0];
      let id2 = albumDB.getAlbumIds()[1];
      expect(id1).not.to.equal(id2);
    });

  });

  describe('getAlbum', function() {

    beforeEach(async function() {
      await albumDB.update();
    });

    it('returns null when album not found', function() {
      expect(albumDB.getAlbum('missing')).to.be.null;
    });

    it('returns requested album', function() {
      expect(albumDB.getAlbum('7ffe1e9d')).to.be.instanceof(Album);
      expect(albumDB.getAlbum('7ffe1e9d').artist).to.equal('Pink Floyd');
    });

    it('returns album with track and correct paths', async function() {
      let id = albumDB.getAlbumIds()[0];
      let album = albumDB.getAlbum(id);

      expect(album.tracks).to.have.length(5);
      expect(album.tracks[0].path).to.equal('albums/animals/01.ogg');
    });

  });

  describe('getAlbumIds', function() {

    it('returns empty array by default', function() {
      expect(albumDB.getAlbumIds()).to.be.empty;
    });

    it('returns array of strings', async function() {
      await albumDB.update();
      expect(albumDB.getAlbumIds()).not.to.be.empty;
      expect(albumDB.getAlbumIds()[0]).to.be.a('string');
    });

    it('returns a copy', async function() {
      await albumDB.update();
      let ids1 = albumDB.getAlbumIds();
      let ids2 = albumDB.getAlbumIds();
      expect(ids1).not.to.equal(ids2);
      expect(ids1).to.deep.equal(ids2);
    });

  });

  describe('search', function() {

    beforeEach(async function() {
      await albumDB.update();
    });

    it('returns matching albums', function() {
      expect(albumDB.search(['colt'])).to.eql([{album: albumDB.getAlbum('4dc98dd6'), tracks: []}]);
    });

    it('returns matching tracks', function() {
      expect(albumDB.search(['pig', 'wing'])).to.eql([{
        album: albumDB.getAlbum('7ffe1e9d'),
        tracks: [albumDB.getAlbum('7ffe1e9d').tracks[0], albumDB.getAlbum('7ffe1e9d').tracks[4]]
      }]);
    });

    it('respects limit', function() {
      expect(albumDB.search(['']).length).to.be.above(1);
      expect(albumDB.search([''], 1).length).to.equal(1);
    });

  });

});
