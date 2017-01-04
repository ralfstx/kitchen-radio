import {expect, tmpdir, restore} from '../test';
import {writeFileSync} from 'fs';
import {join} from 'path';
import {sha1Str, sha1File, crc32Str, crc32File} from '../../src/lib/hash';

// Use a long test string to test reading with multiple buffers
const TEST_STR = 'test'.repeat(100000);
const TEST_STR_CRC32 = '56396a47';
const TEST_STR_SHA1 = 'ea3ec3b9fb22a45ddbd33b144b5d35acc52ae91a';

describe('hash', function() {

  let dirname;
  let expectedToFail = () => { throw new Error('expected to fail'); };

  beforeEach(function() {
    dirname = tmpdir();
  });

  afterEach(restore);

  describe('sha1Str', function() {

    it('returns SHA-1 hash for string', function() {
      expect(sha1Str(TEST_STR)).to.equal(TEST_STR_SHA1);
    });

    it('throws with other types', function() {
      expect(() => sha1Str()).to.throw(Error, /not a string/i);
      expect(() => sha1Str(23)).to.throw(Error, /not a string/i);
    });

  });

  describe('crc32Str', function() {

    it('returns CRC-32 hash for string', function() {
      expect(crc32Str(TEST_STR)).to.equal(TEST_STR_CRC32);
    });

    it('throws with other types', function() {
      expect(() => crc32Str()).to.throw(Error, /not a string/i);
      expect(() => crc32Str(23)).to.throw(Error, /not a string/i);
    });

  });

  describe('sha1File', function() {

    it('succeeds on file', function() {
      let filename = join(dirname, 'foo');
      writeFileSync(filename, TEST_STR);

      return sha1File(filename).then(result => {
        expect(result).to.equal(TEST_STR_SHA1);
      });
    });

    it('throws on missing file', function() {
      let filename = join(dirname, 'foo');

      return sha1File(filename).then(expectedToFail, err => {
        expect(err.code).to.equal('ENOENT');
      });
    });

    it('throws on directory', function() {
      return sha1File(dirname).then(expectedToFail, err => {
        expect(err.code).to.equal('EISDIR');
      });
    });

  });

  describe('crc32File', function() {

    it('succeeds on file', function() {
      let filename = join(dirname, 'foo');
      writeFileSync(filename, TEST_STR);

      return crc32File(filename).then(result => {
        expect(result).to.equal(TEST_STR_CRC32);
      });
    });

    it('throws on missing file', function() {
      let filename = join(dirname, 'foo');

      return crc32File(filename).then(expectedToFail, err => {
        expect(err.code).to.equal('ENOENT');
      });
    });

    it('throws on directory', function() {
      return crc32File(dirname).then(expectedToFail, err => {
        expect(err.code).to.equal('EISDIR');
      });
    });

  });

});
