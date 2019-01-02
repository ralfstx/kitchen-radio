import { readFile } from 'fs-extra';
import * as http from 'http';
import * as Koa from 'koa';
import * as conditional from 'koa-conditional-get';
import * as etag from 'koa-etag';
import * as morgan from 'koa-morgan';
import * as Router from 'koa-router';
import * as serveStatic from 'koa-static';
import { join } from 'path';
import rfs from 'rotating-file-stream';
import { albumsRouter } from '../routes/albums';
import { playerRouter } from '../routes/player';
import { stationsRouter } from '../routes/stations';
import { Config } from './Config';
import { Context } from './Context';
import { createErrorHandler } from './ErrorHandler';
import { Logger } from './Logger';
import { ensure } from './util';

const staticDir = join(__dirname, '../static');
const viewsDir = join(__dirname, '../views');

export class Server {

  private _logger: Logger;
  private _port: number;
  private _app: Koa;
  private _httpServer: http.Server | undefined;

  constructor(context: Context) {
    this._logger = ensure(context.logger).child('Server');
    this._port = ensure(context.config).port;
    this._app = new Koa();
    this._app.on('error', err => this._logger.error('Server error', {err}));
    this._app.use((conditional as any)());
    this._app.use((etag as any)());
    this._app.use(createLogAppender(ensure(context.config)));
    this._app.use(createViewsRenderer(viewsDir));
    this._app.use(createErrorHandler(this._logger));
    this._app.use(serveStatic(staticDir, {maxAge: 3600000}));
    this._app.use(async (ctx, next) => {
      if (ctx.path === '/') {
        await ctx.render('index', {});
      }
      await next();
    });
    this._addRouter('/player', playerRouter(context));
    this._addRouter('/albums', albumsRouter(context));
    this._addRouter('/stations', stationsRouter(context));
  }

  public async start() {
    return new Promise((resolve) => {
      this._httpServer = this._app.listen(this._port, () => {
        this._logger.info(`HTTP server listening on port ${this._port}`);
        resolve();
      });
    });
  }

  public get httpServer(): http.Server {
    if (!this._httpServer) {
      throw new Error('not started');
    }
    return this._httpServer;
  }

  private _addRouter(prefix: string, router: Router) {
    router.prefix(prefix);
    this._app.use(router.routes()).use(router.allowedMethods());
  }
}

export function isHtml(ctx: Koa.Context) { // TODO
  return ctx.request.query.type !== 'json' && ctx.accepts(['json', 'html']) === 'html';
}

function createViewsRenderer(root: string) {
  return async function(ctx: Koa.Context, next: () => Promise<any>) {
    if (ctx.render) return next();
    ctx.render = async function(relPath: string, options: any = {}) {
      let filePath = join(root, relPath + '.html');
      let content = await readFile(filePath, 'utf-8');
      ctx.body = content.replace(/\${\s*(.*?)\s*}/g, (m, m1) => m1 in options ? options[m1] : '');
    };
    return next();
  };
}

function createLogAppender(config: Config) {
  let accessLogStream = rfs('access.log', {
    interval: '1d',
    maxFiles: 5,
    path: config.logDir
  });
  return morgan('common', { stream: accessLogStream });
}
