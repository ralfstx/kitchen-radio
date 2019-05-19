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

  router.put('/status', bodyParser(), async ctx => {
    let body = ctx.request.body;
    for (const key in body) {
      if (key !== 'command') {
        ctx.status = 400;
        ctx.message = 'Unknown parameter';
        return;
      }
    }
    if (body.command === 'play') {
      await player.play();
      ctx.body = await player.status();
    } else if (body.command === 'pause') {
      await player.pause();
      ctx.body = await player.status();
    } else if (body.command === 'stop') {
      await player.stop();
      ctx.body = await player.status();
    } else if (body.command === 'next') {
      await player.next();
      ctx.body = await player.status();
    } else if (body.command === 'prev') {
      await player.prev();
      ctx.body = await player.status();
    } else {
      ctx.status = 400;
      ctx.message = 'Unknown command';
    }
  });

  router.get('/playlist', async ctx => {
    ctx.body = await player.playlist();
  });

  router.post('/playlist', bodyParser(), async ctx => {
    if (!Array.isArray(ctx.request.body)) {
      ctx.status = 400;
      ctx.message = 'Not an array';
    } else {
      await player.replace(ctx.request.body);
      ctx.body = {};
    }
  });

  router.put('/playlist', bodyParser(), async ctx => {
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
