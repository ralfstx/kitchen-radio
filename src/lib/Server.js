/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }]*/
import 'source-map-support/register';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import {join} from 'path';
import {readFile} from 'fs';

import {router as albumsRouter} from '../routes/albums';
import {router as stationsRouter} from '../routes/stations';
import {router as playerRouter} from '../routes/player';

const staticDir = join(__dirname, '../static');
const viewsDir = join(__dirname, '../views');

export default class Server {

  constructor(context) {
    this.logger = context.logger;
    this._port = context.port;
    this.app = express();
    this.app.use(morgan('dev'/*, {stream: this.logger.stream}*/));
    this.app.use(bodyParser.json());
    // setup template engine
    this.app.engine('html', engine);
    this.app.set('views', viewsDir);
    this.app.set('view engine', 'html');
    // setup resources
    this.app.use(express.static(staticDir));
    this.app.get('/', (req, res) => res.render('index', {}));
    this.app.use('/player', playerRouter(context));
    this.app.use('/albums', albumsRouter(context));
    this.app.use('/stations', stationsRouter(context));
    // handle errors
    this.app.use(handleNotFound);
    this.app.use(handleError);
  }

  start() {
    return this.app.listen(this._port, () => {
      this.logger.info(`Server listening on port ${this._port}`);
    });
  }

}

export function isHtml(req) {
  return req.query.type !== 'json' && req.accepts(['json', 'html']) === 'html';
}

function handleNotFound(req, res, next) {
  if (isHtml(req)) {
    res.status(404).render('404', {});
  } else {
    res.status(404).json({error: 'Not Found'});
  }
}

function handleError(err, req, res, next) {
  console.error(err);
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
