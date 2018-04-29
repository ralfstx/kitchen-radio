import {join} from 'path';
import {expect, catchError} from '../test';
import {getTrackMetadata} from '../../src/lib/metadata';

describe('metadata', function() {

  describe('getTrackMetadata', function() {

    it('returns only length if no metadata present', async function() {
      let file = join(__dirname, 'files/test.ogg');
      let result = await getTrackMetadata(file);
      expect(result).to.deep.equal({length: 0}); // very short track
    });

    it('throws on missing file', async function() {
      let file = join(__dirname, 'missing.ogg');
      let err = await catchError(getTrackMetadata(file));
      expect(err.code).to.equal('ENOENT');
    });

  });

});
