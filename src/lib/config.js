let values = require('../config.json');

exports.get = function(name) {
  return values[name];
};
