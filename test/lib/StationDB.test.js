import {join} from 'path';
import {copy} from 'fs-extra';
import {expect, tmpdir, spy, restore} from '../test';
import Context from '../../src/lib/Context';
import StationDB from '../../src/lib/StationDB';

describe('StationDB', function() {

  let db, musicDir;

  beforeEach(async function() {
    let tmp = tmpdir();
    musicDir = join(tmp, 'music');
    await copy(join(__dirname, 'files', 'stations'), join(musicDir, 'stations'));
    let logger = {info: spy(), warn: spy()};
    db = new StationDB(new Context({logger, musicDir}));
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
      expect(db.getIndex()[0]).to.contain.all.keys(['id', 'name', 'stream']);
    });

    it('does not append stations to existing when called twice', function() {
      let origLength = db.getIndex().length;
      return db.update().then(() => {
        expect(db.getIndex().length).to.equal(origLength);
      });
    });

  });

  describe('getStation', function() {

    beforeEach(function() {
      return db.update();
    });

    it('returns station', function() {
      expect(db.getStation('dlf')).to.contain.all.keys({name: 'Deutschlandfunk'});
    });

    it('returns null for unknown ids', function() {
      expect(db.getStation()).to.be.null;
      expect(db.getStation('')).to.be.null;
      expect(db.getStation('foo')).to.be.null;
    });

  });

});
