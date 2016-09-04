import {Router} from 'express';
import {join} from 'path';

import config from '../lib/config';
import AlbumDB from '../lib/AlbumDB';

const albumsDir = join(config.get('musicDir'), 'albums');

let db = new AlbumDB(albumsDir);
db.update();

export function router() {
  let router = new Router();
  router.get('/', (req, res) => {
    res.json(db.getIndex());
  });
  router.get('/:id', (req, res) => {
    res.json(db.getAlbum(req.params.id).toObject());
  });
  router.get('/update', (req, res) => {
    db.update().then(results => res.json(results));
  });
  router.get('/update-images', (req, res) => {
    db.updateImages().then(results => res.json(results));
  });
  return router;
}
