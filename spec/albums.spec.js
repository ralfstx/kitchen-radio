let expect = require('chai').expect;
let stub = require('sinon').stub;
let Promise = require('bluebird');
let Path = require('path');
let Fs = Promise.promisifyAll(require('fs'));
let del = require('del');
let mkdirp = Promise.promisify(require('mkdirp'));

let Logger = require('../src/lib/logger');
let Config = require('../src/lib/config');
let Albums = require('../src/albums');

describe('albums', function() {

  let musicDir = Config.get('musicDir');
  let albumsDir = Path.join(musicDir, 'albums');
  let testDir = Path.dirname(module.filename);

  beforeEach(function() {
    stub(Logger, 'info');
    stub(Logger, 'error');
    return mkdirp(albumsDir)
      .then(mkdirp(Path.join(albumsDir, 'foo')))
      .then(mkdirp(Path.join(albumsDir, 'bar')))
      .then(copy(Path.join(testDir, 'Nashorn.jpg'), Path.join(albumsDir, 'bar', 'cover.jpg')));
  });

  afterEach(function() {
    Logger.info.restore();
    Logger.error.restore();
    del(albumsDir);
  });

  describe('updateImages', function() {

    it('reports missing cover images', function() {
      return Albums.updateImages()
        .then(results => expect(results.missing).to.contain(Path.join(albumsDir, 'foo', 'cover.jpg')));
    });

    it('creates missing scaled images', function() {
      return Albums.updateImages()
        .then(() => Fs.statAsync(Path.join(albumsDir, 'bar', 'cover-100.jpg')))
        .then(() => Fs.statAsync(Path.join(albumsDir, 'bar', 'cover-250.jpg')));
    });

    it('reports written scaled images', function() {
      return Albums.updateImages().then(results => {
        expect(results.written).to.contain(Path.join(albumsDir, 'bar', 'cover-100.jpg'));
        expect(results.written).to.contain(Path.join(albumsDir, 'bar', 'cover-250.jpg'));
      });
    });

    it('does not re-create existing scaled images', function() {
      Albums.updateImages()
        .then(() => Albums.updateImages())
        .then(results => expect(results.written).to.eql([]));
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
