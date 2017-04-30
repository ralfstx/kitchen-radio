import {Router} from 'express';

export function router(context) {
  let player = context.player;
  let router = new Router();
  router.get('/status', (req, res, next) => {
    player.status().then(data => res.json(data)).catch(err => next(err));
  });
  router.get('/playlist', (req, res, next) => {
    player.playlist().then(data => res.json(data)).catch(err => next(err));
  });
  router.get('/play', (req, res, next) => {
    player.play(req.query.pos || 0).then(() => res.json({})).catch(err => next(err));
  });
  router.get('/stop', (req, res, next) => {
    player.stop().then(() => res.json({})).catch(err => next(err));
  });
  router.get('/pause', (req, res, next) => {
    player.pause().then(() => res.json({})).catch(err => next(err));
  });
  router.get('/prev', (req, res, next) => {
    player.prev().then(() => res.json({})).catch(err => next(err));
  });
  router.get('/next', (req, res, next) => {
    player.next().then(() => res.json({})).catch(err => next(err));
  });
  router.post('/replace', (req, res, next) => {
    if (!Array.isArray(req.body)) {
      res.status(400).json({error: 'Not an array'});
    } else {
      player.replace(req.body).then(() => res.json({})).catch(err => next(err));
    }
  });
  router.post('/append', (req, res, next) => {
    if (!Array.isArray(req.body)) {
      res.status(400).json({error: 'Not an array'});
    } else {
      player.append(req.body).then(() => res.json({})).catch(err => next(err));
    }
  });
  return router;
}
