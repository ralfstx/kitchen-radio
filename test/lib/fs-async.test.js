const {expect} = require('../test');
const fs = require('fs');
const fsAsync = require('../../src/lib/fs-async');

describe('fs-async', function() {

  it('contains neutral methods (createReadStream)', function() {
    expect(fsAsync.createReadStream).to.be.a('function');
    expect(fsAsync.createReadStream).to.equal(fs.createReadStream);
  });

  it('contains sync methods (statSync)', function() {
    expect(fsAsync.statSync).to.be.a('function');
    expect(fsAsync.statSync).to.equal(fs.statSync);
  });

  it('contains constants (R_OK)', function() {
    expect(fsAsync.R_OK).to.be.a('number');
    expect(fsAsync.R_OK).to.equal(fs.R_OK);
  });

  it('contains async methods (statAsync)', function() {
    expect(fsAsync.statAsync).to.be.a('function');
  });

  it('statAsync returns a Promise that resolves', function() {
    return fsAsync.statAsync('.').then(result => {
      expect(result.isDirectory()).to.be.true;
    });
  });

  it('statAsync returns a Promise that rejects', function() {
    return fsAsync.statAsync('does/not/exist').then(fail, err => {
      expect(err.code).to.equal('ENOENT');
    });
  });

  it('does not modify original module', function() {
    expect(fs.statAsync).to.be.undefined;
  });

});

function fail() {
  throw new Error();
}
