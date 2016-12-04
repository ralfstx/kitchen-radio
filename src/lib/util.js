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
