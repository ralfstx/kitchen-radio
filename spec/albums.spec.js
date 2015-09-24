var Promise = require("bluebird");
var Path = require("path");
var Fs = Promise.promisifyAll(require("fs"));
var del = require("del");
var mkdirp = Promise.promisify(require('mkdirp'));

var Config = require("../src/lib/config");
var Albums = require("../src/albums");

describe("albums", () => {

  var musicDir = Config.get("musicDir");
  var albumsDir = Path.join(musicDir, "albums");
  var testDir = Path.dirname(module.filename);

  beforeEach(done => {
    mkdirp(albumsDir)
      .then(mkdirp(Path.join(albumsDir, "foo")))
      .then(mkdirp(Path.join(albumsDir, "bar")))
      .then(copy(Path.join(testDir, "Nashorn.jpg"), Path.join(albumsDir, "bar", "cover.jpg")))
      .then(done, done.fail);
  });

  afterEach(() => {
    del(albumsDir);
  });

  describe("updateImages", () => {

    it("reports missing cover images", done => {
      Albums.updateImages()
        .then(results => expect(results.missing).toContain(Path.join(albumsDir, "foo", "cover.jpg")))
        .then(done, done.fail);
    });

    it("creates missing scaled images", done => {
      Albums.updateImages()
        .then(() => Fs.statAsync(Path.join(albumsDir, "bar", "cover-100.jpg")))
        .then(() => Fs.statAsync(Path.join(albumsDir, "bar", "cover-250.jpg")))
        .then(done, done.fail);
    });

    it("reports written scaled images", done => {
      Albums.updateImages().then(results => {
        expect(results.written).toContain(Path.join(albumsDir, "bar", "cover-100.jpg"));
        expect(results.written).toContain(Path.join(albumsDir, "bar", "cover-250.jpg"));
      }).then(done, done.fail);
    });

    it("does not re-create existing scaled images", done => {
      Albums.updateImages()
        .then(() => Albums.updateImages())
        .then(results => expect(results.written).toEqual([]))
        .then(done, done.fail);
    });

  });

  function copy(srcPath, dstPath) {
    return new Promise((resolve, reject) => {
      var srcStream = Fs.createReadStream(srcPath).on("error", reject);
      var dstStream = Fs.createWriteStream(dstPath).on("error", reject).on("finish", resolve);
      srcStream.pipe(dstStream);
    });
  }

});
