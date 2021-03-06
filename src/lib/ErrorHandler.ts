import * as http from 'http';
import * as Koa from 'koa';
import { Logger } from './Logger';

export function createErrorHandler(logger: Logger) {

  return async (ctx: Koa.Context, next: () => Promise<any>) => {
    try {
      await next();
      if (ctx.status >= 400) await renderError(ctx);
    } catch (err) {
      logger.error('Server error', {err});
      ctx.status = err.status || 500;
      await renderError(ctx);
    }
  };

  async function renderError(ctx: Koa.Context) {
    let status = ctx.status;
    let statusText = http.STATUS_CODES[status];
    let message = ctx.message !== statusText ? ctx.message : '';
    ctx.body = {error: statusText, ...(message ? {message} : {})};
    ctx.status = status; // status code is reset to 200 when body is written
  }

}
