import { statSync } from 'fs-extra';
import { join } from 'path';
import { Context } from '../../src/lib/Context';
import { CoverDB } from '../../src/lib/CoverDB';
import { catchError, expect, restore, spy, tmpdir } from '../test';

describe('CoverDB', function() {

  const exampleCoverFile = join(__dirname, 'files/albums/animals/cover.jpg');
  let coverDB: CoverDB;
  let cacheDir;

  beforeEach(async function() {
    let tmpDir = tmpdir();
    cacheDir = join(tmpDir, 'cache');
    let logger = {child: () => ({debug: spy(), info: spy(), warn: spy(), error: spy()})};
    let albumDB = {getAlbum: (id: string) => ({id, path: id})};
    coverDB = new CoverDB(new Context({logger, albumDB, config: {cacheDir}}));
    await coverDB.init();
  });

  afterEach(restore);

  describe('storeAlbumCover', function() {

    it('throws if file does not exist', async function() {
      let error = await catchError(coverDB.storeAlbumCover('4711', 'not/there'));

      expect(error.message).to.equal('Missing cover image \'not/there\'');
    });

  });

  describe('getAlbumCover', function() {

    it('returns null for invalid id', async function() {
      let result = await coverDB.getAlbumCover('missing');

      expect(result).to.be.null;
    });

    it('returns existing file for valid id', async function() {
      await coverDB.storeAlbumCover('foo', exampleCoverFile);

      let result = await coverDB.getAlbumCover('foo');

      expect(result).not.to.be.null;
      expect(statSync(result!).size).to.be.above(0);
    });

    it('returns existing file for valid id and size', async function() {
      await coverDB.storeAlbumCover('foo', exampleCoverFile);

      let result = await coverDB.getAlbumCover('foo', 100);

      expect(result).not.to.be.null;
      expect(statSync(result!).size).to.be.above(0);
    });

    it('returns different files for different sizes', async function() {
      await coverDB.storeAlbumCover('foo', exampleCoverFile);

      let result = await coverDB.getAlbumCover('foo');
      let result100 = await coverDB.getAlbumCover('foo', 100);

      expect(result).not.to.equal(result100);
      expect(statSync(result!).size).not.to.equal(statSync(result100!).size);
    });

    it('returns same files for subsequent calls', async function() {
      await coverDB.storeAlbumCover('foo', exampleCoverFile);

      let result1 = await coverDB.getAlbumCover('foo', 100);
      let result2 = await coverDB.getAlbumCover('foo', 100);

      expect(result1).to.equal(result2);
      expect(statSync(result1!).mtime).to.deep.equal(statSync(result2!).mtime);
    });

  });

  // describe('updateImages', function() {

  //   beforeEach(async function() {
  //     await db.update();
  //   });

  //   it('reports missing cover images', async function() {
  //     unlinkSync(join(musicDir, 'albums/animals', 'cover.jpg'));
  //     let results = await db.updateImages();
  //     expect(results.missing).to.contain(join(musicDir, 'albums/animals', 'cover.jpg'));
  //   });

  //   it('creates missing scaled images', async function() {
  //     await db.updateImages(musicDir);
  //     statSync(join(musicDir, 'albums/animals', 'cover-100.jpg'));
  //     statSync(join(musicDir, 'albums/animals', 'cover-250.jpg'));
  //   });

  //   it('reports written scaled images', async function() {
  //     let results = await db.updateImages(musicDir);
  //     expect(results.written).to.contain(join(musicDir, 'albums/animals', 'cover-100.jpg'));
  //     expect(results.written).to.contain(join(musicDir, 'albums/animals', 'cover-250.jpg'));
  //   });

  //   it('does not re-create existing scaled images', async function() {
  //     let results = await db.updateImages().then(() => db.updateImages());
  //     expect(results.written).to.eql([]);
  //   });

  // });

});
