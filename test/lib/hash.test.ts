import { writeFile } from 'fs-extra';
import { join } from 'path';
import { crc32File, crc32Str, sha1File, sha1Str } from '../../src/lib/hash';
import { catchError, expect, restore, tmpdir } from '../test';

// Use a long test string to test reading with multiple buffers
const TEST_STR = 'test'.repeat(100000);
const TEST_STR_CRC32 = '56396a47';
const TEST_STR_SHA1 = 'ea3ec3b9fb22a45ddbd33b144b5d35acc52ae91a';

describe('hash', function() {

  let dirname: string;

  beforeEach(function() {
    dirname = tmpdir();
  });

  afterEach(restore);

  describe('sha1Str', function() {

    it('returns SHA-1 hash for string', function() {
      expect(sha1Str(TEST_STR)).to.equal(TEST_STR_SHA1);
    });

  });

  describe('crc32Str', function() {

    it('returns CRC-32 hash for string', function() {
      expect(crc32Str(TEST_STR)).to.equal(TEST_STR_CRC32);
    });

  });

  describe('sha1File', function() {

    it('succeeds on file', async function() {
      let filename = join(dirname, 'foo');
      await writeFile(filename, TEST_STR);

      let result = await sha1File(filename);
      expect(result).to.equal(TEST_STR_SHA1);
    });

    it('throws on missing file', async function() {
      let filename = join(dirname, 'foo');

      let err = await catchError(sha1File(filename));
      expect(err.code).to.equal('ENOENT');
    });

    it('throws on directory', async function() {
      let err = await catchError(sha1File(dirname));
      expect(err.code).to.equal('EISDIR');
    });

  });

  describe('crc32File', function() {

    it('succeeds on file', async function() {
      let filename = join(dirname, 'foo');
      await writeFile(filename, TEST_STR);

      let result = await crc32File(filename);
      expect(result).to.equal(TEST_STR_CRC32);
    });

    it('throws on missing file', async function() {
      let filename = join(dirname, 'foo');

      let err = await catchError(crc32File(filename));
      expect(err.code).to.equal('ENOENT');
    });

    it('throws on directory', async function() {
      let err = await catchError(crc32File(dirname));
      expect(err.code).to.equal('EISDIR');
    });

  });

});
