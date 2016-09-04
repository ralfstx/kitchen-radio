import {Router} from 'express';

import config from '../lib/config';
import Player from '../lib/Player';

let mpdHost = config.get('mpdHost') || 'localhost';
let mpdPort = config.get('mpdPort') || 6600;

let player = new Player();

player.connectMpd(mpdHost, mpdPort);

export function router() {
  let router = new Router();
  router.get('/status', (req, res) => {
    player.status().then(data => res.json(data));
  });
  router.get('/playlist', (req, res) => {
    player.playlist().then(data => res.json(data));
  });
  router.get('/play', (req, res) => {
    player.play().then(() => res.json({}));
  });
  router.get('/stop', (req, res) => {
    player.stop().then(() => res.json({}));
  });
  router.get('/pause', (req, res) => {
    player.pause().then(() => res.json({}));
  });
  router.get('/prev', (req, res) => {
    player.prev().then(() => res.json({}));
  });
  router.get('/next', (req, res) => {
    player.next().then(() => res.json({}));
  });
  router.post('/replace', (req, res) => {
    player.replace(req.body).then(() => res.json({}));
  });
  router.post('/append', (req, res) => {
    player.append(req.body).then(() => res.json({}));
  });
  return router;
}
