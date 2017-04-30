import chai, {expect} from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {dirSync} from 'tmp';

chai.use(sinonChai);

let sandbox = sinon.sandbox.create();
let spy = sandbox.spy.bind(sandbox);
let stub = sandbox.stub.bind(sandbox);
let tmpDirs = [];

export {expect, spy, stub, tmpdir, restore};

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
