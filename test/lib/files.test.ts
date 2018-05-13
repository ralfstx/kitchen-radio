import {join} from 'path';
import {expect, tmpdir, restore} from '../test';
import {writeFile} from 'fs-extra';

import {statSafe} from '../../src/lib/files';

let baseDir: string;

describe('files', function() {

  beforeEach(function() {
    baseDir = tmpdir();
  });

  afterEach(restore);

  describe('statSafe', function() {

    it('returns stats for file', async function() {
      let path = join(baseDir, 'file');
      await writeFile(path, 'content');

      let stats = await statSafe(path);

      expect(stats.isFile()).to.be.true;
    });

    it('returns null for missing file', async function() {
      let path = join(baseDir, 'missing');

      let stats = await statSafe(path);

      expect(stats).to.be.null;
    });

  });

});
