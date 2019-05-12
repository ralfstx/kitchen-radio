import * as Koa from 'koa';
import * as request from 'supertest';
import { createErrorHandler } from '../../src/lib/ErrorHandler';
import { spy } from '../test';

describe('ErrorHandler', function() {

  let handler: any;
  let app: Koa;

  beforeEach(async function() {
    let logger: any = {debug: spy(), info: spy(), warn: spy(), error: spy()};
    handler = createErrorHandler(logger);
    app = new Koa();
  });

  it('returns 404 if not handled', async () => {
    app.use(handler);

    await request(app.callback())
      .get('/')
      .expect(404);
  });

  it('returns JSON otherwise', async () => {
    app.use(handler);

    await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({error: 'Not Found'});
  });

  it('includes message in HTML', async () => {
    app.use(handler);
    app.use(ctx => {
      ctx.status = 400;
      ctx.message = 'Stupid question';
    });

    await request(app.callback())
      .get('/')
      .set('Accept', 'text/html')
      .expect(/Bad Request/)
      .expect(/Stupid question/);
  });

  it('includes message in JSON', async () => {
    app.use(handler);
    app.use(ctx => {
      ctx.status = 400;
      ctx.message = 'Stupid question';
    });

    await request(app.callback())
      .get('/')
      .expect({error: 'Bad Request', message: 'Stupid question'});
  });

  it('returns 500 for server errors', async () => {
    app.use(handler);
    app.use(ctx => {
      throw new Error('bang!');
    });

    await request(app.callback())
      .get('/')
      .expect(500);
  });

});
