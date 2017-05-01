import {join} from 'path';
import {expect, spy, tmpdir, restore, catchError} from '../test';
import {mkdirSync, writeFileSync} from 'fs-extra';

import {walk, getSubDirs, statSafe} from '../../src/lib/files';

let baseDir;

describe('files', function() {

  beforeEach(function() {
    baseDir = tmpdir();
  });

  afterEach(restore);

  describe('walk', function() {

    it('calls callback for every file and directory with relative path', async function() {
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
      await walk(baseDir, callback);
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

    it('calls callback for every file and directory with stats', async function() {
      createTmpDir('A/');
      createTmpFile('A/b');
      let callback = spy();
      await walk(baseDir, callback);
      callback.args.forEach(args => expect('mtime' in args[1]));
    });

    it('recurses only if callback returns truthy', async function() {
      let callback = spy(path => path !== 'B');
      createTmpFiles(
        'A/',
        'A/a',
        'B/',
        'B/b',
        'C/',
        'C/c'
      );
      await walk(baseDir, callback);
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

  describe('getSubDirs', function() {

    it('returns all sub directories', async function() {
      createTmpFiles(
        'A/',
        'A/file',
        'B/',
        'B/X/',
        'C/',
        'file-1',
        'file-2'
      );
      let result = await getSubDirs(baseDir);
      expect(result).to.eql(['A', 'B', 'C']);
    });

    it('throws on files', async function() {
      createTmpFile('foo');
      let err = await catchError(getSubDirs(join(baseDir, 'foo')));
      expect(err.message).to.equal(`Could not read directory: '${baseDir}/foo'`);
    });

    it('throws on missing files', async function() {
      let err = await catchError(getSubDirs(join(baseDir, 'missing')));
      expect(err.message).to.equal(`Could not read directory: '${baseDir}/missing'`);
    });

  });

  describe('statSafe', function() {

    it('returns stats for file', async function() {
      createTmpFile('foo');
      let stats = await statSafe(join(baseDir, 'foo'));
      expect(stats.isFile()).to.be.true;
    });

    it('returns null for missing file', async function() {
      let stats = await statSafe(join(baseDir, 'missing'));
      expect(stats).to.be.null;
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
