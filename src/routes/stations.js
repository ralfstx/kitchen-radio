import {Router} from 'express';
import {resolve} from 'path';

export function router(context) {
  let db = context.stationDB;
  let musicDir = context.musicDir;
  let router = new Router();
  router.get('/', (req, res) => {
    res.json(db.getIndex());
  });
  router.get('/:id/image', (req, res, next) => {
    let station = db.getStation(req.params.id);
    if (station) {
      res.sendFile(resolve(musicDir, station.path, station.icon));
      return;
    }
    next();
  });
  router.get('/update', (req, res) => {
    db.update().then(results => res.json(results));
  });
  return router;
}
