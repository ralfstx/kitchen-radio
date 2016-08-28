let Fs = require('fs');

exports.walk = walk;
exports.readProps = readProps;
exports.readPropFile = readPropFile;
exports.toJson = toJson;

function walk(list, fn, callback) {
  if (list.length > 0) {
    try {
      fn(list[0], (err) => {
        if (err) {
          callback(err);
        } else {
          walk(list.slice(1), fn, callback);
        }
      });
    } catch (err) {
      callback(err);
    }
  } else {
    callback(null);
  }
}

function readProps(data, fn) {
  let props = {};
  data.toString().split('\n').forEach((line, index) => {
    if (!/^\s*(#|$)/.test(line)) {
      let match = /^\s*(\S+)\s*:\s*(.*?)\s*$/.exec(line);
      if (!match) {
        throw new Error('Syntax error in line ' + (index + 1));
      }
      if (typeof fn === 'function') {
        fn(match[1], match[2]);
      } else {
        props[match[1]] = match[2];
      }
    }
  });
  return props;
}

function readPropFile(path, callback) {
  Fs.readFile(path, (err, data) => {
    if (err) return callback(err);
    try {
      let props = readProps(data);
      callback(null, props);
    } catch (err2) {
      callback(new Error(err2.message + ' in file ' + path));
    }
  });
}

function toJson(data) {
  return JSON.stringify(data, null, ' ');
}
