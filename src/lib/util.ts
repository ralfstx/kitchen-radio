export function readProps(data, callback = (key, value, props) => props[key] = value) {
  let props = {};
  if (typeof data === 'string') {
    data.split('\n').forEach((line, index) => {
      if (!/^\s*(#|$)/.test(line)) {
        let match = /^\s*(\S+)\s*:\s*(.*?)\s*$/.exec(line);
        if (!match) {
          throw new Error('Syntax error in line ' + (index + 1));
        }
        callback(match[1], match[2], props);
      }
    });
  }
  return props;
}

export function toJson(data) {
  if (!arguments.length) return '';
  return JSON.stringify(data, null, ' ');
}

/**
 * Returns a promisified version of a given function.
 * @template T
 * @param {(...any) => T} fn the function to promisify
 * @returns {(...any) => Promise<T>}
 */
export function promisify(fn) {
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

/**
 * Returns a copy of the given object that contains only members with the given keys.
 * @param {{}} obj the object to filter
 * @param {string[]} keys the keys to copy
 */
export function pick(obj, keys) {
  let res = {};
  for (let key of keys) {
    if (key in obj) {
      res[key] = obj[key];
    }
  }
  return res;
}
