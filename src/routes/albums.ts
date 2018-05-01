import { Router } from 'express';
import { join } from 'path';
import { Context } from '../lib/Context';
import { isHtml } from '../lib/Server';

export function albumsRouter(context: Context) {
  let logger = context.logger;
  let albumDB = context.albumDB;
  let coverDB = context.coverDB;
  let musicDir = context.config.musicDir;
  let router = Router();
  router.get('/', (req, res) => {
    if (isHtml(req)) {
      res.render('albums', {});
    } else {
      let index = albumDB.getAlbumIds().map(id => ({id, name: albumDB.getAlbum(id).name}));
      res.json(index);
    }
  });
  router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    let album = albumDB.getAlbum(id);
    if (album) {
      if (isHtml(req)) {
        res.render('album', {title: album.name, url: `/albums/${id}`});
      } else {
        res.json({
          id,
          tags: album.tags,
          name: album.name,
          discs: album.discs.map(disc => ({
            name: disc.name,
            tracks: disc.tracks.map(track => ({
              artist: track.artist,
              title: track.title,
              length: track.length
            }))
          }))
        });
      }
    } else {
      next();
    }
  });
  router.get('/:id/cover', async (req, res, next) => {
    try {
      let size = req.query.size ? parseInt(req.query.size) : 0;
      let file = await coverDB.getAlbumCover(req.params.id, size);
      if (file) {
        res.sendFile(file, {maxAge: 36000});
        return;
      }
    } catch (err) {
      logger.error(err);
      res.status(500).json({error: err});
      return;
    }
    next();
  });
  router.get('/:id/tracks/:number', (req, res, next) => {
    let album = albumDB.getAlbum(req.params.id);
    if (album) {
      let number = parseInt(req.params.number) - 1;
      let track = album.tracks[number];
      if (track) {
        res.sendFile(join(musicDir, track.path));
        return;
      }
    }
    next();
  });
  router.get('/:id/discs/:dnr/tracks/:tnr', (req, res, next) => {
    let album = albumDB.getAlbum(req.params.id);
    if (album) {
      let dnr = parseInt(req.params.dnr);
      let disc = album.discs[dnr - 1];
      if (disc) {
        let tnr = parseInt(req.params.tnr);
        let track = disc.tracks[tnr - 1];
        if (track) {
          res.sendFile(join(musicDir, track.path));
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
      res.json(albumDB.search(terms).map(match => ({
        id: match.album.id,
        name: match.album.name,
        tracks: match.tracks.map(track => match.album.tracks.indexOf(track))
      })));
    }
  });
  router.get('/update', async (req, res) => {
    let {count} = await albumDB.update();
    let message = `Found ${count} albums`;
    if (isHtml(req)) {
      res.render('ok', {message});
    } else {
      res.json({message});
    }
  });
  return router;
}