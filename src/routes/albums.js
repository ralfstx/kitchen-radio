import {Router} from 'express';
import {join} from 'path';
import {isHtml} from '../lib/Server';

export function router(context) {
  let db = context.albumDB;
  let musicDir = context.musicDir;
  let router = new Router();
  router.get('/', (req, res) => {
    if (isHtml(req)) {
      res.render('albums', {});
    } else {
      res.json(db.getAlbums().map(album => ({id: album.id, name: album.name})));
    }
  });
  router.get('/:id', (req, res, next) => {
    let album = db.getAlbum(req.params.id);
    if (album) {
      if (isHtml(req)) {
        res.render('album', {title: album.name, url: `/albums/${album.id}`});
      } else {
        res.json(album);
      }
    } else {
      next();
    }
  });
  router.get('/:id/cover', async (req, res, next) => {
    let album = db.getAlbum(req.params.id);
    if (album) {
      res.sendFile(join(musicDir, album.path, selectCoverImage(req.query.size)));
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
        res.sendFile(join(musicDir, track.location));
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
          res.sendFile(join(musicDir, track.location));
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
        id: match.album.id,
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
