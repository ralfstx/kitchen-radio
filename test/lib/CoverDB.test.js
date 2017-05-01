import {join} from 'path';
import {copy, statSync} from 'fs-extra';
import {expect, tmpdir, spy, restore} from '../test';
import Context from '../../src/lib/Context';
import CoverDB from '../../src/lib/CoverDB';

describe('CoverDB', function() {

  let coverDB, cacheDir;

  beforeEach(async function() {
    let tmpDir = tmpdir();
    let musicDir = join(tmpDir, 'music');
    cacheDir = join(tmpDir, 'cache');
    await copy(join(__dirname,'files/albums/animals'), join(musicDir, 'animals'));
    let logger = {info: spy(), warn: spy()};
    let albumDB = {
      getAlbum(id) {
        if (id === 'animals') {
          return {
            id: 'animals',
            location: 'animals'
          };
        }
        return null;
      }
    };
    coverDB = new CoverDB(new Context({logger, musicDir, cacheDir, albumDB}));
  });

  afterEach(restore);

  describe('getAlbumCover', function() {

    it('returns null for invalid id', async function() {
      let result = await coverDB.getAlbumCover('bar');
      expect(result).to.be.null;
    });

    it('returns existing file for valid id', async function() {
      let result = await coverDB.getAlbumCover('animals');
      expect(result).not.to.be.null;
      expect(statSync(result).size).to.be.above(0);
    });

    it('returns existing file for valid id and size', async function() {
      let result = await coverDB.getAlbumCover('animals', 100);
      expect(result).not.to.be.null;
      expect(statSync(result).size).to.be.above(0);
    });

    it('returns different files for different sizes', async function() {
      let result = await coverDB.getAlbumCover('animals');
      let result100 = await coverDB.getAlbumCover('animals', 100);
      expect(result).not.to.equal(result100);
      expect(statSync(result).size).not.to.equal(statSync(result100).size);
    });

    it('returns same files for subsequent calls', async function() {
      let result1 = await coverDB.getAlbumCover('animals', 100);
      let result2 = await coverDB.getAlbumCover('animals', 100);
      expect(result1).to.equal(result2);
      expect(statSync(result1).mtime).to.deep.equal(statSync(result2).mtime);
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