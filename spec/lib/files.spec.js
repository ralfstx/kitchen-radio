import {join} from 'path';
import {expect} from 'chai';
import {spy} from 'sinon';
import {mkdirSync, writeFileSync} from 'fs';

import {callRecursive, ensureIsFile, ensureIsDir, getSubDirs, statAsyncSafe, readJsonFile} from '../../src/lib/files';

import del from 'del';
const tmpDir = 'mocha-tmp';

describe('files', function() {


  beforeEach(function() {
    mkdirSync(tmpDir);
  });

  afterEach(function() {
    return del(tmpDir);
  });

  describe('callRecursive', function() {

    it('calls callback for every file and directory with absolute path', function() {
      let callback = spy();
      createTmpFiles(
        'A/',
        'A/1/',
        'A/1/a',
        'A/1/b',
        'A/2',
        'A/1/a',
        'B'
      );
      return callRecursive(tmpDir, callback).then(() => {
        expect(callback.args.map(args => args[0])).to.eql([
          tmpDir,
          tmpDir + '/A',
          tmpDir + '/A/1',
          tmpDir + '/A/1/a',
          tmpDir + '/A/1/b',
          tmpDir + '/A/2',
          tmpDir + '/B'
        ]);
      });
    });

    it('calls callback for every file and directory with stats', function() {
      createTmpDir('A/');
      createTmpFile('A/b');
      let callback = spy();
      return callRecursive(tmpDir, callback).then(() => {
        callback.args.forEach(args => expect('mtime' in args[1]));
      });
    });

  });

  describe('ensureIsFile', function() {

    it('does nothing on files', function() {
      createTmpFile('foo');
      return ensureIsFile(join(tmpDir, 'foo'));
    });

    it('throws on directories', function() {
      createTmpDir('foo');
      return ensureIsFile(join(tmpDir, 'foo')).then(fail('Expected to throw'), err => {
        expect(err.message).to.match(/Not a file: '/);
      });
    });

    it('throws on missing files', function() {
      return ensureIsFile(join(tmpDir, 'missing')).then(fail('Expected to throw'), err => {
        expect(err.message).to.match(/No such file: '/);
      });
    });

  });

  describe('ensureIsDir', function() {

    it('does nothing on directories', function() {
      createTmpDir('foo');
      return ensureIsDir(join(tmpDir, 'foo'));
    });

    it('throws on files', function() {
      createTmpFile('foo');
      return ensureIsDir(join(tmpDir, 'foo')).then(fail('Expected to throw'), err => {
        expect(err.message).to.match(/Not a directory: '/);
      });
    });

    it('throws on missing files', function() {
      return ensureIsDir(join(tmpDir, 'missing')).then(fail('Expected to throw'), err => {
        expect(err.message).to.match(/No such directory: '/);
      });
    });

  });

  describe('getSubDirs', function() {

    it('returns all sub directories', function() {
      createTmpFiles(
        'A/',
        'A/file',
        'B/',
        'B/X/',
        'C/',
        'file-1',
        'file-2'
      );
      return getSubDirs(tmpDir).then(result => {
        expect(result).to.eql(['A', 'B', 'C']);
      });
    });

    it('throws on files', function() {
      createTmpFile('foo');
      return getSubDirs(join(tmpDir, 'foo')).then(fail('Expected to throw'), err => {
        expect(err.message).to.equal("Could not read directory: 'mocha-tmp/foo'");
      });
    });

    it('throws on missing files', function() {
      return getSubDirs(join(tmpDir, 'missing')).then(fail('Expected to throw'), err => {
        expect(err.message).to.equal("Could not read directory: 'mocha-tmp/missing'");
      });
    });

  });

  describe('statAsyncSafe', function() {

    it('returns stats for file', function() {
      createTmpFile('foo');
      return statAsyncSafe(join(tmpDir, 'foo')).then(stats => {
        expect(stats.isFile()).to.be.true;
      });
    });

    it('returns null for missing file', function() {
      return statAsyncSafe(join(tmpDir, 'missing')).then(stats => {
        expect(stats).to.be.null;
      });
    });

  });

  describe('readJsonFile', function() {

    it('reads JSON file', function() {
      createTmpFile('foo', '{"foo": 23}');
      return readJsonFile(join(tmpDir, 'foo')).then(data => {
        expect(data).to.eql({foo: 23});
      });
    });

    it('throws on missing files', function() {
      return readJsonFile(join(tmpDir, 'missing')).then(fail('Expected to throw'), err => {
        expect(err.message).to.match(/Could not read JSON file/);
      });
    });

  });

});

function createTmpFiles() {
  for (let name of arguments) {
    if (name.endsWith('/')) {
      createTmpDir(name);
    } else {
      createTmpFile(name);
    }
  }
}

function createTmpFile(name, content = 'content') {
  writeFileSync(join(tmpDir, name), content);
}

function createTmpDir(name) {
  mkdirSync(join(tmpDir, name));
}

function fail(message) {
  return () => {
    throw new Error(message);
  };
}
