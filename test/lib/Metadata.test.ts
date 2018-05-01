import { join } from 'path';
import { Metadata } from '../../src/lib/Metadata';
import { catchError, expect } from '../test';

describe('metadata', function() {

  describe('getTrackMetadata', function() {

    it('returns only length if no metadata present', async function() {
      let file = join(__dirname, 'files/test.ogg');

      let result = await Metadata.getTrackMetadata(file);

      expect(result).to.deep.equal({length: 0}); // very short track
    });

    it('throws on missing file', async function() {
      let file = join(__dirname, 'missing.ogg');

      let err = await catchError(Metadata.getTrackMetadata(file));

      expect(err.code).to.equal('ENOENT');
    });

  });

});
