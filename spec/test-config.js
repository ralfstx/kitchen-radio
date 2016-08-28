let Config = require('../src/lib/config');

let testConfig = {
  port: 9878,
  logDir: '.',
  logLevel: 'debug',
  musicDir: '/tmp/music'
};

let oldGet = Config.get;

Config.get = function(name) {
  if (name in testConfig) {
    return testConfig[name];
  }
  return oldGet(name);
};
