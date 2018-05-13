import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { dirSync } from 'tmp';

chai.use(sinonChai);

let expect = chai.expect;
let sandbox = sinon.sandbox.create();
let spy: sinon.SinonSpyStatic = sandbox.spy.bind(sandbox);
let stub: sinon.SinonStubStatic = sandbox.stub.bind(sandbox);
let tmpDirs: any[] = [];

export { expect, spy, stub, tmpdir, restore, catchError };

/**
 * Creates a temporary directory. The directory will be cleaned up by calling `restore()`.
 * @returns the name of the created directory
 */
function tmpdir(): string {
  let dir = dirSync({unsafeCleanup: true});
  tmpDirs.push(dir);
  return dir.name;
}

/**
 * Restores spied and stubbed functions and cleans up temporary directories.
 */
function restore() {
  sandbox.restore();
  tmpDirs.forEach(dir => dir.removeCallback());
  tmpDirs = [];
}

/**
 * Executes the given promise. Throws if the promise succeeds, and returns the error if it fails.
 *
 * @param promise a promise to execute
 * @returns the caught error
 */
function catchError(promise: Promise<any>): Promise<any> {
  return promise.then(result => {
    throw new Error('Expected promise to fail but it resolved with ' + result);
  }, (err) => err);
}
