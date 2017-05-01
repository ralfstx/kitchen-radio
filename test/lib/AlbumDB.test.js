import {join} from 'path';
import {copy} from 'fs-extra';
import {expect, tmpdir, spy, restore} from '../test';
import {Album} from '../../src/lib/album-types';
import Context from '../../src/lib/Context';
import AlbumDB from '../../src/lib/AlbumDB';

describe('AlbumDB', function() {

  let albumDB, musicDir;

  beforeEach(async function() {
    musicDir = tmpdir();
    await copy(join(__dirname, 'files', 'albums'), join(musicDir, 'albums'));
    let logger = {info: spy(), warn: spy()};
    albumDB = new AlbumDB(new Context({logger, musicDir}));
  });

  afterEach(restore);

  it('is initially empty', function() {
    expect(albumDB.getAlbums()).to.eql([]);
  });

  describe('update', function() {

    beforeEach(async  function() {
      await albumDB.update();
    });

    it('fills db with albums', function() {
      expect(albumDB.getAlbums().length).to.be.above(1);
    });

    it('does not append albums to existing when called twice', async function() {
      let origLength = albumDB.getAlbums().length;
      await albumDB.update();
      expect(albumDB.getAlbums().length).to.equal(origLength);
    });

    it('creates ids for albums', async function() {
      await albumDB.update();
      let album = albumDB.getAlbums()[0];
      expect(album.id).to.match(/^[0-9a-z]{8}$/);
    });

    it('creates unique ids', async function() {
      await albumDB.update();
      let albums = albumDB.getAlbums();
      expect(albums[0].id).not.to.equal(albums[1].id);
    });

  });

  describe('getAlbum', function() {

    beforeEach(async function() {
      await albumDB.update();
    });

    it('returns requested album', function() {
      expect(albumDB.getAlbum('966c69dd')).to.be.instanceof(Album);
      expect(albumDB.getAlbum('966c69dd').artist).to.equal('Pink Floyd');
    });

    it('returns null when album not found', function() {
      expect(albumDB.getAlbum('missing')).to.be.null;
    });

  });

  describe('getAlbums', function() {

    beforeEach(async function() {
      await albumDB.update();
    });

    it('returns alls albums', function() {
      expect(albumDB.getAlbums().map(album => album.title))
        .to.contain('Animals')
        .to.contain('Blue Train');
    });

    it('returns albums sorted by name', function() {
      expect(albumDB.getAlbums().map(album => album.name)).to.eql([
        'John Coltrane - Blue Train',
        'Pink Floyd - Animals'
      ]);
    });

  });

  describe('search', function() {

    beforeEach(async function() {
      await albumDB.update();
    });

    it('returns matching albums', function() {
      expect(albumDB.search(['colt'])).to.eql([{album: albumDB.getAlbum('6ff57aa3'), tracks: []}]);
    });

    it('returns matching tracks', function() {
      expect(albumDB.search(['pig', 'wing'])).to.eql([{
        album: albumDB.getAlbum('966c69dd'),
        tracks: [albumDB.getAlbum('966c69dd').tracks[0], albumDB.getAlbum('966c69dd').tracks[4]]
      }]);
    });

    it('respects limit', function() {
      expect(albumDB.search(['']).length).to.be.above(1);
      expect(albumDB.search([''], 1).length).to.equal(1);
    });

  });

});
