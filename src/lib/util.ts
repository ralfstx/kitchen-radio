/**
 * Reads `key: value` pairs from the lines of a string.
 * @param data the input string
 * @param callback an optional callback to preprocess each key-value pair
 * @returns a map of properties
 */
export function readProps(data: string, callback = defCallback): {[key: string]: string} {
  let props = {};
  data.split('\n').forEach((line, index) => {
    if (!/^\s*(#|$)/.test(line)) {
      let match = /^\s*(\S+)\s*:\s*(.*?)\s*$/.exec(line);
      if (!match) {
        throw new Error('Syntax error in line ' + (index + 1));
      }
      callback(match[1], match[2], props);
    }
  });
  return props;
}

function defCallback(key: string, value: string, properties?: {[key: string]: string}) {
  properties[key] = value;
}

export function toJson(data) {
  if (!arguments.length) return '';
  return JSON.stringify(data, null, ' ');
}

/**
 * Returns a promisified version of a given function.
 * @param fn the function to promisify
 * @returns a function that returns a promise
 */
export function promisify<T>(fn: (...any) => T): (...any) => Promise<T> {
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
 * @param obj the object to filter
 * @param keys the keys to copy
 */
export function pick(obj: {}, keys: string[]) {
  let res = {};
  for (let key of keys) {
    if (key in obj) {
      res[key] = obj[key];
    }
  }
  return res;
}