import { writeJson } from 'fs-extra';
import { Config } from '../../src/lib/Config';
import { expect, restore, tmpdir, catchError } from '../test';
import { join } from 'path';

describe('Config', function() {

  describe('constructor', function() {

    it('throws on missing config value', function() {
      let call = () => new Config({});

      expect(call).to.throw('Missing config value');
    });

    it('has defaults', async function() {
      let config = new Config({
        musicDir: 'foo',
        cacheDir: 'bar'
      });

      expect(config.port).to.equal(8080);
      expect(config.logLevel).to.equal('info');
    });

    it('overrides defaults with config values', async function() {
      let config = new Config({
        musicDir: 'foo',
        cacheDir: 'bar',
        port: 80
      });

      expect(config.port).to.equal(80);
    });

  });

  describe('readFromFile', function() {

    let configFile: string;

    beforeEach(async function() {
      let dir = tmpdir();
      configFile = join(dir, 'config.json');
    });

    afterEach(restore);

    it('throws on missing file', async function() {
      let error = await catchError(Config.readFromFile('/missing/file'));

      expect(error.message).to.include('Could not read config file \'/missing/file\'')
          .and.include('no such file or directory');
    });

    it('creates config object with values from file', async function() {
      await writeJson(configFile, {
        musicDir: 'foo',
        cacheDir: 'bar'
      });
      let config = await Config.readFromFile(configFile);

      expect(config.musicDir).to.equal('foo');
      expect(config.cacheDir).to.equal('bar');
    });

  });

});
