import {join} from 'path';
import {expect} from '../test';
import {getTrackMetadata} from '../../src/lib/metadata';

let expectFail = () => { throw new Error('expected to fail'); };

describe('metadata', function() {

  describe('getTrackMetadata', function() {

    it('returns only length if no metadata present', function() {
      let file = join(__dirname, 'files/test.ogg');
      return getTrackMetadata(file).then(result => {
        expect(result).to.deep.equal({length: 0}); // very short track
      });
    });

    it('throws on missing file', function() {
      let file = join(__dirname, 'missing.ogg');
      return getTrackMetadata(file).then(expectFail, err => {
        expect(err.code).to.equal('ENOENT');
      });
    });

  });

});
