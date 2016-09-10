import {Router} from 'express';
import {join} from 'path';

export function router(context) {
  let db = context.get('instance:StationDB');
  let stationsDir = context.get('stationsDir');
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
