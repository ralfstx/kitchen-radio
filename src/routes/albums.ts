import * as bodyParser from 'koa-body';
import * as Router from 'koa-router';
import * as send from 'koa-send';
import { Album } from '../lib/Album';
import { Context } from '../lib/Context';
import { isHtml } from '../lib/Server';
import { ensure } from '../lib/util';

export function albumsRouter(context: Context) {
  let albumDB = ensure(context.albumDB);
  let coverDB = ensure(context.coverDB);
  let musicDir = ensure(context.config).musicDir;
  let router = new Router();
  router.get('/', async (ctx) => {
    if (isHtml(ctx)) {
      await ctx.render('albums', {});
    } else {
      ctx.body = albumDB.getAlbumIds().map(id => ({id, name: albumDB.getAlbum(id)!.name}));
    }
  });
  router.get('/search', async (ctx) => {
    let query = ctx.query.q || '';
    let terms = query.split(/\s+/);
    if (isHtml(ctx)) {
      await ctx.render('search', {query});
    } else {
      ctx.body = albumDB.search(terms).map(match => ({
        id: match.id,
        name: match.album.name,
        tracks: match.tracks.map(track => match.album.tracks.indexOf(track))
      }));
    }
  });
  router.get('/update', async (ctx) => {
    let {count} = await albumDB.update();
    let message = `Found ${count} albums`;
    if (isHtml(ctx)) {
      await ctx.render('ok', {message});
    } else {
      ctx.body = {message};
    }
  });
  router.get('/:id', async (ctx) => {
    let id = ctx.params.id;
    let album = albumDB.getAlbum(id);
    if (album) {
      if (isHtml(ctx)) {
        await ctx.render('album', {title: album.name, url: `/albums/${id}`});
      } else {
        ctx.body = {id, ...serializeAlbum(album)};
      }
    }
  });
  router.post('/:id', bodyParser(), async function(ctx) {
    let id = ctx.params.id;
    let album = albumDB.getAlbum(ctx.params.id);
    if (album) {
      let {action, content} = ctx.request.body;
      if (action === 'add-tags') {
        album.addTags(content);
      } else if (action === 'remove-tags') {
        album.removeTags(content);
      } else {
        ctx.status = 400;
        ctx.message = `unknown action '${action}'`;
      }
      await albumDB.saveAlbum(id);
      ctx.body = {id, ...serializeAlbum(album)};
    }
  });
  router.get('/:id/cover', async (ctx) => {
    let size = ctx.query.size ? parseInt(ctx.query.size) : 0;
    let file = await coverDB.getAlbumCover(ctx.params.id, size);
    if (file) {
      await send(ctx, file, {root: '/', maxAge: 36000});
    }
  });
  router.get('/:id/tracks/:number', async (ctx) => {
    let album = albumDB.getAlbum(ctx.params.id);
    if (album) {
      let number = parseInt(ctx.params.number) - 1;
      let track = album.tracks[number];
      if (track) {
        await send(ctx, track.path, {root: musicDir});
      }
    }
  });
  router.get('/:id/discs/:dnr/tracks/:tnr', async (ctx) => {
    let album = albumDB.getAlbum(ctx.params.id);
    if (album) {
      let dnr = parseInt(ctx.params.dnr);
      let disc = album.discs[dnr - 1];
      if (disc) {
        let tnr = parseInt(ctx.params.tnr);
        let track = disc.tracks[tnr - 1];
        if (track) {
          await send(ctx, track.path, {root: musicDir});
        }
      }
    }
  });
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
