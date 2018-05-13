import { Router } from 'express';
import { resolve } from 'path';
import { Context } from '../lib/Context';
import { isHtml } from '../lib/Server';
import { ensure } from '../lib/util';

export function stationsRouter(context: Context) {
  let stationDB = ensure(context.stationDB);
  let musicDir = ensure(context.config).musicDir;
  let router = Router();
  router.get('/', (req, res) => {
    let index = stationDB.getStationIds().map(id => stationDB.getStation(id));
    res.json(index);
  });
  router.get('/:id/image', (req, res, next) => {
    let station = stationDB.getStation(req.params.id);
    if (station) {
      res.sendFile(resolve(musicDir, station.path, station.image));
      return;
    }
    next();
  });
  router.get('/update', async (req, res) => {
    let {count} = await stationDB.update();
    let message = `Found ${count} stations`;
    if (isHtml(req)) {
      res.render('ok', {message});
    } else {
      res.json({message});
    }
  });
  return router;
}
