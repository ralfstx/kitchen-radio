import {join} from 'path';
import {expect, spy, tmpdir, restore} from '../test';
import {mkdirSync, writeFileSync} from 'fs-extra';

import {walk, getSubDirs, statSafe} from '../../src/lib/files';

let baseDir;

describe('files', function() {

  beforeEach(function() {
    baseDir = tmpdir();
  });

  afterEach(restore);

  describe('walk', function() {

    it('calls callback for every file and directory with relative path', function() {
      let callback = spy(() => true);
      createTmpFiles(
        'A/',
        'A/a',
        'A/1/',
        'A/1/a',
        'A/1/b',
        'A/2/',
        'b'
      );
      return walk(baseDir, callback).then(() => {
        expect(callback.args.map(args => args[0])).to.deep.equal([
          '',
          'A',
          'A/1',
          'A/1/a',
          'A/1/b',
          'A/2',
          'A/a',
          'b'
        ]);
      });
    });

    it('calls callback for every file and directory with stats', function() {
      createTmpDir('A/');
      createTmpFile('A/b');
      let callback = spy();
      return walk(baseDir, callback).then(() => {
        callback.args.forEach(args => expect('mtime' in args[1]));
      });
    });

    it('recurses only if callback returns truthy', function() {
      let callback = spy(path => path !== 'B');
      createTmpFiles(
        'A/',
        'A/a',
        'B/',
        'B/b',
        'C/',
        'C/c'
      );
      return walk(baseDir, callback).then(() => {
        expect(callback.args.map(args => args[0])).to.deep.equal([
          '',
          'A',
          'A/a',
          'B',
          'C',
          'C/c'
        ]);
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
      return getSubDirs(baseDir).then(result => {
        expect(result).to.eql(['A', 'B', 'C']);
      });
    });

    it('throws on files', function() {
      createTmpFile('foo');
      return getSubDirs(join(baseDir, 'foo')).then(fail('Expected to throw'), err => {
        expect(err.message).to.equal(`Could not read directory: '${baseDir}/foo'`);
      });
    });

    it('throws on missing files', function() {
      return getSubDirs(join(baseDir, 'missing')).then(fail('Expected to throw'), err => {
        expect(err.message).to.equal(`Could not read directory: '${baseDir}/missing'`);
      });
    });

  });

  describe('statSafe', function() {

    it('returns stats for file', function() {
      createTmpFile('foo');
      return statSafe(join(baseDir, 'foo')).then(stats => {
        expect(stats.isFile()).to.be.true;
      });
    });

    it('returns null for missing file', function() {
      return statSafe(join(baseDir, 'missing')).then(stats => {
        expect(stats).to.be.null;
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
  writeFileSync(join(baseDir, name), content);
}

function createTmpDir(name) {
  mkdirSync(join(baseDir, name));
}

function fail(message) {
  return () => {
    throw new Error(message);
  };
}
