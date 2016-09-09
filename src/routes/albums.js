import {Router} from 'express';
import {join} from 'path';

import config from '../lib/config';
import AlbumDB from '../lib/AlbumDB';

const albumsDir = join(config.get('musicDir'), 'albums');

let db = new AlbumDB(albumsDir);
db.update();

let isHtml = req => req.query.type !== 'json' && req.accepts(['json', 'html']) === 'html';

export function router() {
  let router = new Router();
  router.get('/', (req, res) => {
    if (isHtml(req)) {
      res.render('albums', {});
    } else {
      res.json(db.getAlbums().map(album => ({path: album.path, name: album.name})));
    }
  });
  router.get('/:id', (req, res, next) => {
    let album = db.getAlbum(req.params.id);
    if (album) {
      if (isHtml(req)) {
        res.render('album', {title: album.name, url: `/albums/${album.path}`});
      } else {
        res.json(db.getAlbum(req.params.id).toObject());
      }
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
      let number = parseInt(req.params.number) - 1;
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
  router.get('/search', (req, res) => {
    let query = req.query.q || '';
    let terms = query.split(/\s+/);
    if (isHtml(req)) {
      res.render('search', {query});
    } else {
      res.json(db.search(terms).map(match => ({
        path: match.album.path,
        name: match.album.name,
        tracks: match.tracks.map(track => track.number)
      })));
    }
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
