import * as Router from 'koa-router';
import * as send from 'koa-send';
import { join } from 'path';
import { Context } from '../lib/Context';
import { isHtml } from '../lib/Server';
import { ensure } from '../lib/util';

export function stationsRouter(context: Context) {
  let stationDB = ensure(context.stationDB);
  let musicDir = ensure(context.config).musicDir;
  let router = new Router();
  router.get('/', (ctx) => {
    ctx.body = stationDB.getStationIds().map(id => stationDB.getStation(id));
  });
  router.get('/:id/image', async (ctx) => {
    let station = stationDB.getStation(ctx.params.id);
    if (station) {
      await send(ctx, join(station.path, station.image), {root: musicDir});
    }
  });
  router.get('/update', async (ctx) => {
    let {count} = await stationDB.update();
    let message = `Found ${count} stations`;
    if (isHtml(ctx)) {
      await ctx.render('ok', {message});
    } else {
      ctx.body = {message};
    }
  });
  return router;
}
