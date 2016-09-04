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
  router.get('/:id', (req, res, next) => {
    let album = db.getAlbum(req.params.id);
    if (album) {
      res.json(db.getAlbum(req.params.id).toObject());
    } else {
      next();
    }
  });
  router.get('/:id/cover', (req, res, next) => {
    let album = db.getAlbum(req.params.id);
    if (album) {
      res.sendFile(join(albumsDir, album.path, selectCoverImage(req.query.size)));
      return;
    }
    next();
  });
  router.get('/:id/tracks/:number', (req, res, next) => {
    let album = db.getAlbum(req.params.id);
    if (album) {
      let number = parseInt(req.params.number);
      let track = album.tracks[number];
      if (track) {
        res.sendFile(join(albumsDir, track.location));
        return;
      }
    }
    next();
  });
  router.get('/:id/discs/:dnr/tracks/:tnr', (req, res, next) => {
    let album = db.getAlbum(req.params.id);
    if (album) {
      let dnr = parseInt(req.params.dnr);
      let disc = album.discs[dnr - 1];
      if (disc) {
        let tnr = parseInt(req.params.tnr);
        let track = disc.tracks[tnr - 1];
        if (track) {
          res.sendFile(join(albumsDir, track.location));
          return;
        }
      }
    }
    next();
  });
  router.get('/update', (req, res) => {
    db.update().then(results => res.json(results));
  });
  router.get('/update-images', (req, res) => {
    db.updateImages().then(results => res.json(results));
  });
  return router;
}

function selectCoverImage(size) {
  if (size && parseInt(size) <= 100) {
    return 'cover-100.jpg';
  }
  if (size && parseInt(size) <= 250) {
    return 'cover-250.jpg';
  }
  return 'cover.jpg';
}
