import * as bodyParser from 'koa-body';
import * as Router from 'koa-router';
import * as send from 'koa-send';
import { basename, join } from 'path';
import { ZipFile } from 'yazl';
import { Album } from '../lib/Album';
import { AlbumDB } from '../lib/AlbumDB';
import { Context } from '../lib/Context';
import { ensure } from '../lib/util';

export function albumsRouter(context: Context) {
  let albumDB = ensure(context.albumDB);
  let coverDB = ensure(context.coverDB);
  let musicDir = ensure(context.config).musicDir;
  let router = new Router();

  router.get('/', async (ctx) => {
    ctx.body = getAlbums(albumDB);
  });

  router.put('/', async (ctx) => {
    await albumDB.update();
    ctx.body = getAlbums(albumDB);
  });

  router.get('/search', async (ctx) => {
    let query = ctx.query.q || '';
    let terms = query.split(/\s+/);
    ctx.body = albumDB.search(terms).map(match => ({
      id: match.id,
      name: match.album.name,
      tracks: match.tracks.map(track => match.album.tracks.indexOf(track))
    }));
  });

  router.get('/:id', async (ctx) => {
    let id = ctx.params.id;
    let album = albumDB.getAlbum(id);
    if (album) {
      ctx.body = {id, ...serializeAlbum(album)};
    }
  });

  router.put('/:id', bodyParser(), async function(ctx) {
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
      await send(ctx, file, {root: '/', hidden: true, maxAge: 3600000});
    }
  });

  router.get('/:id/tracks/:number', async (ctx) => {
    let album = albumDB.getAlbum(ctx.params.id);
    if (album) {
      let number = parseInt(ctx.params.number) - 1;
      let track = album.tracks[number];
      if (track) {
        await send(ctx, track.path, {root: musicDir, hidden: true, maxAge: 3600000});
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
          await send(ctx, track.path, {root: musicDir, hidden: true, maxAge: 3600000});
        }
      }
    }
  });

  router.get('/:id/download', async (ctx) => {
    let id = ctx.params.id;
    let album = albumDB.getAlbum(id);
    if (album) {
      let zipStream = await createDownloadZip(album, musicDir);
      ctx.set('content-disposition', 'attachment; filename="album.zip"');
      ctx.body = zipStream;
    }
  });

  return router;
}

function getAlbums(albumDB: AlbumDB): any {
  return albumDB.getAlbumIds().map(id => ({ id, name: albumDB.getAlbum(id)!.name }));
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

async function createDownloadZip(album: Album, musicDir: string) {
  let zip = new ZipFile();
  for (let disc of album.discs) {
    let discName = album.discs.length === 1 ? null : pad2(album.discs.indexOf(disc) + 1);
    for (let track of disc.tracks) {
      let trackName = basename(track.path);
      let trackZipFileName = discName ? discName + '/' + trackName : trackName;
      zip.addFile(join(musicDir, track.path), trackZipFileName);
    }
  }
  zip.end();
  return zip.outputStream;
}

function pad2(n: number) {
  return (n < 10 ? '0' : '') + n;
}
