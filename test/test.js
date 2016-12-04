import chai, {expect} from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {dirSync} from 'tmp';
import {statSync, mkdirSync, readdirSync, createReadStream, createWriteStream} from 'fs';
import {join} from 'path';

chai.use(sinonChai);

let sandbox = sinon.sandbox.create();
let spy = sandbox.spy.bind(sandbox);
let stub = sandbox.stub.bind(sandbox);
let tmpDirs = [];

export {expect, spy, stub, tmpdir, copy, restore};

function tmpdir() {
  let dir = dirSync({unsafeCleanup: true});
  tmpDirs.push(dir);
  return dir.name;
}

function restore() {
  sandbox.restore();
  tmpDirs.forEach(dir => dir.removeCallback());
  tmpDirs = [];
}

function copy(src, dst) {
  let stats = statSync(src);
  if (stats.isDirectory()) {
    mkdirSync(dst);
    readdirSync(src).forEach(name => copy(join(src, name), join(dst, name)));
  } else {
    createReadStream(src).pipe(createWriteStream(dst));
  }
}
