/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }]*/
import 'source-map-support/register';
import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import {join} from 'path';
import {readFile} from 'fs';

import {router as albumsRouter} from '../routes/albums';
import {router as stationsRouter} from '../routes/stations';
import {router as playerRouter} from '../routes/player';

const staticDir = join(__dirname, '../static');
const viewsDir = join(__dirname, '../views');

export default class Server {

  constructor() {
    this.app = express();
    this.app.use(logger('dev'));
    this.app.use(bodyParser.json());
    // setup template engine
    this.app.engine('html', engine);
    this.app.set('views', viewsDir);
    this.app.set('view engine', 'html');
    // setup resources
    this.app.use(express.static(staticDir));
    this.app.use('/player', playerRouter());
    this.app.use('/albums', albumsRouter());
    this.app.use('/stations', stationsRouter());
    // handle errors
    this.app.use(handleNotFound);
    this.app.use(handleError);
  }

  start(port) {
    this.app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  }

}

export function isHtml(req) {
  return req.query.type !== 'json' && req.accepts(['json', 'html']) === 'html';
}

function handleNotFound(req, res, next) {
  if (isHtml(req)) {
    res.render('404', {});
  } else {
    res.json({error: 'Not Found'});
  }
}

function handleError(err, req, res, next) {
  res.status(err.status || 500);
  let title = err.status === 404 ? 'Not Found' : 'Server Error';
  if (isHtml(req)) {
    res.render('error', {
      title,
      message: err.message,
      stack: err.stack
    });
  } else {
    res.json({
      error: title,
      message: err.message,
    });
  }
}

function engine (filePath, options, callback) {
  readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    let rendered = content.toString().replace(/\${\s*(.*?)\s*}/g, (m, m1) => m1 in options ? options[m1] : '');
    return callback(null, rendered);
  });
}
