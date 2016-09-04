import {expect, tmpdir, copy, stub, restore} from '../test';
import logger from '../../src/lib/logger';
import StationDB from '../../src/lib/StationDB';
import {join} from 'path';

describe('StationDB', function() {

  let db, stationsDir;

  beforeEach(function() {
    stub(logger, 'info');
    stub(logger, 'warn');
    let tmp = tmpdir();
    stationsDir = join(tmp, 'stations');
    copy(join(__dirname, 'files', 'stations'), stationsDir);
    db = new StationDB(stationsDir);
  });

  afterEach(restore);

  it('is initially empty', function() {
    expect(db.getIndex()).to.eql([]);
  });

  describe('update', function() {

    beforeEach(function() {
      return db.update();
    });

    it('fills db with stations', function() {
      expect(db.getIndex().length).to.be.above(1);
      expect(db.getIndex()[0]).to.contain.all.keys(['name', 'icon', 'stream']);
    });

    it('does not append stations to existing when called twice', function() {
      let origLength = db.getIndex().length;
      return db.update().then(() => {
        expect(db.getIndex().length).to.equal(origLength);
      });
    });

  });

});
