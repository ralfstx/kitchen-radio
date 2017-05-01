import {join} from 'path';
import {expect, tmpdir, restore} from '../test';
import {writeFileSync} from 'fs-extra';

import {statSafe} from '../../src/lib/files';

let baseDir;

describe('files', function() {

  beforeEach(function() {
    baseDir = tmpdir();
  });

  afterEach(restore);

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

function createTmpFile(name, content = 'content') {
  writeFileSync(join(baseDir, name), content);
}
