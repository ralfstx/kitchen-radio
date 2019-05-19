import * as Router from 'koa-router';
import * as send from 'koa-send';
import { join } from 'path';
import { Context } from '../lib/Context';
import { ensure } from '../lib/util';

export function stationsRouter(context: Context) {
  let stationDB = ensure(context.stationDB);
  let musicDir = ensure(context.config).musicDir;
  let router = new Router();

  router.get('/', (ctx) => {
    ctx.body = stationDB.getStationIds().map(id => stationDB.getStation(id));
  });

  router.put('/', async (ctx) => {
    await stationDB.update();
    ctx.body = stationDB.getStationIds().map(id => stationDB.getStation(id));
  });

  router.get('/:id', async (ctx) => {
    let station = stationDB.getStation(ctx.params.id);
    if (station) {
      ctx.body = station;
    }
  });

  router.get('/:id/image', async (ctx) => {
    let station = stationDB.getStation(ctx.params.id);
    if (station) {
      await send(ctx, join(station.path, station.image), {root: musicDir, hidden: true, maxAge: 3600000});
    }
  });

  return router;
}
