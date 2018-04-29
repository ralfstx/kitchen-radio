import {Router} from 'express';
import {resolve} from 'path';
import {isHtml} from '../lib/Server';
import {Context} from '../lib/Context'; // eslint-disable-line no-unused-vars

/**
 * @param {Context} context
 */
export function router(context) {
  let stationDB = context.stationDB;
  let musicDir = context.config.musicDir;
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
