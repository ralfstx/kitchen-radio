import { NextFunction, Request, Response, Router } from 'express';
import { join } from 'path';
import { Album } from '../lib/Album';
import { Context } from '../lib/Context';
import { isHtml } from '../lib/Server';
import { ensure } from '../lib/util';

export function albumsRouter(context: Context) {
  let albumDB = ensure(context.albumDB);
  let coverDB = ensure(context.coverDB);
  let musicDir = ensure(context.config).musicDir;
  let router = Router();
  router.get('/', safe((req, res) => {
    if (isHtml(req)) {
      res.render('albums', {});
    } else {
      let index = albumDB.getAlbumIds().map(id => ({id, name: albumDB.getAlbum(id)!.name}));
      res.json(index);
    }
  }));
  router.get('/:id', safe((req, res, next) => {
    let id = req.params.id;
    let album = albumDB.getAlbum(id);
    if (album) {
      if (isHtml(req)) {
        res.render('album', {title: album.name, url: `/albums/${id}`});
      } else {
        res.json({id, ...serializeAlbum(album)});
      }
    } else {
      next();
    }
  }));
  router.post('/:id', safe(async function(req, res, next) {
    let id = req.params.id;
    let album = albumDB.getAlbum(req.params.id);
    if (album) {
      let {action, content} = req.body;
      if (action === 'add-tags') {
        album.addTags(content);
      } else if (action === 'remove-tags') {
        album.removeTags(content);
      } else {
        throw httpError(400, `unknown action '${action}'`);
      }
      await albumDB.saveAlbum(id);
      res.json({id, ...serializeAlbum(album)});
      return;
    }
    next();
  }));
  router.get('/:id/cover', safe(async (req, res, next) => {
    let size = req.query.size ? parseInt(req.query.size) : 0;
    let file = await coverDB.getAlbumCover(req.params.id, size);
    if (file) {
      res.sendFile(file, {maxAge: 36000});
      return;
    }
    next();
  }));
  router.get('/:id/tracks/:number', safe((req, res, next) => {
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
  }));
  router.get('/:id/discs/:dnr/tracks/:tnr', safe((req, res, next) => {
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
  }));
  router.get('/search', safe((req, res) => {
    let query = req.query.q || '';
    let terms = query.split(/\s+/);
    if (isHtml(req)) {
      res.render('search', {query});
    } else {
      res.json(albumDB.search(terms).map(match => ({
        id: match.id,
        name: match.album.name,
        tracks: match.tracks.map(track => match.album.tracks.indexOf(track))
      })));
    }
  }));
  router.get('/update', safe(async (req, res) => {
    let {count} = await albumDB.update();
    let message = `Found ${count} albums`;
    if (isHtml(req)) {
      res.render('ok', {message});
    } else {
      res.json({message});
    }
  }));
  return router;
}

function serializeAlbum(album: Album) {
  return {
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
  };
}

function safe(fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

function httpError(status: number, message: string) {
  let error: any = new Error(message);
  error.status = status;
  return error;
}
