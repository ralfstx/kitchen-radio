import * as bodyParser from 'body-parser';
import * as express from 'express';
import { readFile } from 'fs-extra';
import * as morgan from 'morgan';
import { join } from 'path';
import 'source-map-support/register';
import { albumsRouter } from '../routes/albums';
import { playerRouter } from '../routes/player';
import { stationsRouter } from '../routes/stations';
import { Context } from './Context';
import { Logger } from './Logger';

const staticDir = join(__dirname, '../static');
const viewsDir = join(__dirname, '../views');

export class Server {

  private logger: Logger;
  private _port: number;
  private _app: any;
  public httpServer: any;

  constructor(context: Context) {
    this.logger = context.logger;
    this._port = context.config.port;
    this._app = express();
    this._app.use(createLogAppender(this.logger));
    this._app.use(bodyParser.json());
    // setup template engine
    this._app.engine('html', engine);
    this._app.set('views', viewsDir);
    this._app.set('view engine', 'html');
    // setup resources
    this._app.use(express.static(staticDir));
    this._app.get('/', (req, res) => res.render('index', {}));
    this._app.use('/player', playerRouter(context));
    this._app.use('/albums', albumsRouter(context));
    this._app.use('/stations', stationsRouter(context));
    // handle errors
    this._app.use(handleNotFound);
    this._app.use(createErrorHandler(this.logger));
  }

  public async start() {
    return new Promise((resolve) => {
      this.httpServer = this._app.listen(this._port, () => {
        this.logger.info(`HTTP server listening on port ${this._port}`);
        resolve();
      });
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

function engine(filePath, options, callback) {
  readFile(filePath, function(err, content) {
    if (err) return callback(new Error(err.message));
    let rendered = content.toString().replace(/\${\s*(.*?)\s*}/g, (m, m1) => m1 in options ? options[m1] : '');
    return callback(null, rendered);
  });
}

function createErrorHandler(logger) {
  return function handleError(err, req, res, next) {
    logger.error(err);
    res.status(err.status || 500);
    let title = err.status === 'Server Error';
    if (isHtml(req)) {
      res.render('error', {
        title,
        message: err.message,
        stack: err.stack
      });
    } else {
      res.json({
        error: title,
        message: err.message
      });
    }
  };
}

function createLogAppender(logger) {
  let config = {
    stream: {
      write(message) {
        logger.info(message.trim());
      }
    }
  } as any;
  let level = logger.levels[logger.level];
  if (level === 0) {
    config.skip = (req, res) => res.statusCode < 500;
  } else if (level < 3) {
    config.skip = (req, res) => res.statusCode < 400;
  }
  return morgan('tiny', config);
}
