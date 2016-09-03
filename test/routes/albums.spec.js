import {expect} from 'chai';
import {stub} from 'sinon';
import {join} from 'path';
import {statSync, mkdirSync} from 'fs';
import del from 'del';

import {copy} from '../../src/lib/files';
import logger from '../../src/lib/logger';
import {updateImages} from '../../src/routes/albums';

describe('albums', function() {

//  let musicDir = config.get('musicDir');
  let albumsDir = 'albums';

  beforeEach(function() {
    stub(logger, 'info');
    stub(logger, 'error');

    mkdirSync(albumsDir);
    mkdirSync(join(albumsDir, 'foo'));
    mkdirSync(join(albumsDir, 'bar'));
    return copy(join(__dirname, 'Nashorn.jpg'), join(albumsDir, 'bar', 'cover.jpg'));
  });

  afterEach(function() {
    logger.info.restore();
    logger.error.restore();
    return del(albumsDir);
  });

  describe('updateImages', function() {

    it('reports missing cover images', function() {
      return updateImages(albumsDir)
        .then(results => expect(results.missing).to.contain(join(albumsDir, 'foo', 'cover.jpg')));
    });

    it('creates missing scaled images', function() {
      return updateImages(albumsDir)
        .then(() => {
          statSync(join(albumsDir, 'bar', 'cover-100.jpg'));
          statSync(join(albumsDir, 'bar', 'cover-250.jpg'));
        });
    });

    it('reports written scaled images', function() {
      return updateImages(albumsDir).then(results => {
        expect(results.written).to.contain(join(albumsDir, 'bar', 'cover-100.jpg'));
        expect(results.written).to.contain(join(albumsDir, 'bar', 'cover-250.jpg'));
      });
    });

    it('does not re-create existing scaled images', function() {
      updateImages()
        .then(() => updateImages())
        .then(results => expect(results.written).to.eql([]));
    });

  });

});
