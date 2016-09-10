import {Router} from 'express';
import {join} from 'path';
import config from '../lib/config';

export function router() {
  let db = config.get('instance:StationDB');
  let stationsDir = join(config.get('musicDir'), 'stations');
  let router = new Router();
  router.get('/', (req, res) => {
    res.json(db.getIndex());
  });
  router.get('/:id/image', (req, res, next) => {
    let station = db.getStation(req.params.id);
    if (station) {
      res.sendFile(join(stationsDir, station.icon));
      return;
    }
    next();
  });
  router.get('/update', (req, res) => {
    db.update().then(results => res.json(results));
  });
  return router;
}
