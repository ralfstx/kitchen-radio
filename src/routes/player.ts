import * as bodyParser from 'koa-body';
import * as Router from 'koa-router';
import { Context } from '../lib/Context';
import { ensure } from '../lib/util';

export function playerRouter(context: Context) {
  let player = ensure(context.player);
  let router = new Router();
  router.get('/status', async ctx => {
    ctx.body = await player.status();
  });
  router.get('/playlist', async ctx => {
    ctx.body = await player.playlist();
  });
  router.get('/play', async ctx => {
    await player.play(ctx.query.pos || 0);
    ctx.body = {};
  });
  router.get('/stop', async ctx => {
    await player.stop();
    ctx.body = {};
  });
  router.get('/pause', async ctx => {
    await player.pause();
    ctx.body = {};
  });
  router.get('/prev', async ctx => {
    await player.prev();
    ctx.body = {};
  });
  router.get('/next', async ctx => {
    await player.next();
    ctx.body = {};
  });
  router.post('/replace', bodyParser(), async ctx => {
    if (!Array.isArray(ctx.request.body)) {
      ctx.status = 400;
      ctx.message = 'Not an array';
    } else {
      await player.replace(ctx.request.body);
      ctx.body = {};
    }
  });
  router.post('/append', bodyParser(), async ctx => {
    if (!Array.isArray(ctx.request.body)) {
      ctx.status = 400;
      ctx.message = 'Not an array';
    } else {
      await player.append(ctx.request.body);
      ctx.body = {};
    }
  });
  return router;
}
