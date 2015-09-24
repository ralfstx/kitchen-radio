var Config = require("../src/lib/config");

var testConfig = {
  port: 9878,
  logDir: ".",
  logLevel: "debug",
  musicDir: "/tmp/music"
};

var oldGet = Config.get;

Config.get = function(name) {
  if (name in testConfig) {
    return testConfig[name];
  }
  return oldGet(name);
};
