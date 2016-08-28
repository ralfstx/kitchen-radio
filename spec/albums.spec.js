let Promise = require('bluebird');
let Path = require('path');
let Fs = Promise.promisifyAll(require('fs'));
let del = require('del');
let mkdirp = Promise.promisify(require('mkdirp'));

let Config = require('../src/lib/config');
let Albums = require('../src/albums');

describe('albums', () => {

  let musicDir = Config.get('musicDir');
  let albumsDir = Path.join(musicDir, 'albums');
  let testDir = Path.dirname(module.filename);

  beforeEach(done => {
    mkdirp(albumsDir)
      .then(mkdirp(Path.join(albumsDir, 'foo')))
      .then(mkdirp(Path.join(albumsDir, 'bar')))
      .then(copy(Path.join(testDir, 'Nashorn.jpg'), Path.join(albumsDir, 'bar', 'cover.jpg')))
      .then(done, done.fail);
  });

  afterEach(() => {
    del(albumsDir);
  });

  describe('updateImages', () => {

    it('reports missing cover images', done => {
      Albums.updateImages()
        .then(results => expect(results.missing).toContain(Path.join(albumsDir, 'foo', 'cover.jpg')))
        .then(done, done.fail);
    });

    it('creates missing scaled images', done => {
      Albums.updateImages()
        .then(() => Fs.statAsync(Path.join(albumsDir, 'bar', 'cover-100.jpg')))
        .then(() => Fs.statAsync(Path.join(albumsDir, 'bar', 'cover-250.jpg')))
        .then(done, done.fail);
    });

    it('reports written scaled images', done => {
      Albums.updateImages().then(results => {
        expect(results.written).toContain(Path.join(albumsDir, 'bar', 'cover-100.jpg'));
        expect(results.written).toContain(Path.join(albumsDir, 'bar', 'cover-250.jpg'));
      }).then(done, done.fail);
    });

    it('does not re-create existing scaled images', done => {
      Albums.updateImages()
        .then(() => Albums.updateImages())
        .then(results => expect(results.written).toEqual([]))
        .then(done, done.fail);
    });

  });

  function copy(srcPath, dstPath) {
    return new Promise((resolve, reject) => {
      let srcStream = Fs.createReadStream(srcPath).on('error', reject);
      let dstStream = Fs.createWriteStream(dstPath).on('error', reject).on('finish', resolve);
      srcStream.pipe(dstStream);
    });
  }

});
