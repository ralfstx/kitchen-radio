/*
 * Provides a copy of the original 'fs' module with promisified versions of async functions added.
 * For every function 'x' that has an 'xSync' version, an 'xAsync' version is added that returns a Promise.
 */
import fs from 'fs';

module.exports = Object.assign({}, fs);

let members = Object.keys(fs).filter(name => typeof fs[name] === 'function');

for (let name of members) {
  if (!name.endsWith('Sync') && members.indexOf(name + 'Sync') !== -1) {
    module.exports[name + 'Async'] = promisify(fs[name]);
  }
}

function promisify(fn) {
  return function() {
    return new Promise((resolve, reject) => {
      let params = Array.prototype.slice.call(arguments).concat((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
      fn.apply(this, params);
    });
  };
}
