/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }]*/

import 'source-map-support/register';
import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import {join} from 'path';
import {readFile} from 'fs';

import config from './lib/config';
import {router as albumsRouter} from './routes/albums';
import {router as stationsRouter} from './routes/stations';
import {router as playerRouter} from './routes/player';

let webDir = join(__dirname, 'static');

let port = config.get('port') || 8080;

let app = express();
app.use(logger('dev'));
app.use(bodyParser.json());

// ---
app.engine('html', function (filePath, options, callback) {
  readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    let rendered = content.toString().replace(/{{(.*?)}}/g, (m, m1) => options[m1] || '');
    return callback(null, rendered);
  });
});
// ---
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(express.static(webDir));

app.use('/api.html', (req, res) => res.render('api'));

app.use('/files', express.static(config.get('musicDir'), {
  index: 'index.json'
}));

app.use('/player', playerRouter());
app.use('/albums', albumsRouter());
app.use('/stations', stationsRouter());

app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    title: err.status === 404 ? 'Not Found' : err.message || 'Server Error',
    message: "That's an error!"
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
