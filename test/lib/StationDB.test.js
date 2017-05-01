import {join} from 'path';
import {copy, move} from 'fs-extra';
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
    expect(db.getStationIds()).to.be.empty;
  });

  describe('update', function() {

    it('finds stations', async function() {
      await db.update();
      expect(db.getStationIds()).not.to.be.empty;
    });

    it('finds nested stations', async function() {
      await move(join(musicDir, 'stations'), join(musicDir, 'nested'));
      await move(join(musicDir, 'nested'), join(musicDir, 'stations/nested'));
      await db.update();
      expect(db.getStationIds()).not.to.be.empty;
    });

    it('does not append stations to existing when called twice', async function() {
      await db.update();
      let origIds = db.getStationIds();
      await db.update();
      expect(db.getStationIds()).to.deep.equal(origIds);
    });

  });

  describe('getStationIds', function() {

    beforeEach(async function() {
      await db.update();
    });

    it('returns an array', async function() {
      expect(db.getStationIds()).to.be.an('array');
    });

    it('returns a copy', async function() {
      let ids1 = db.getStationIds();
      let ids2 = db.getStationIds();
      expect(ids2).not.to.equal(ids1);
      expect(ids2).to.deep.equal(ids1);
    });

  });

  describe('getStation', function() {

    beforeEach(async function() {
      await db.update();
    });

    it('returns station', function() {
      let id = db.getStationIds()[0];
      expect(db.getStation(id)).to.contain.all.keys(['name', 'image', 'stream']);
    });

    it('returns null for unknown ids', function() {
      expect(db.getStation()).to.be.null;
      expect(db.getStation('')).to.be.null;
      expect(db.getStation('foo')).to.be.null;
    });

  });

});
