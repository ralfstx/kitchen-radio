
var Path = require("path");
var Winston = require("winston");

var Config = require("./config");

var logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: Config.get("logLevel"),
      handleExceptions: true,
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: false
    }),
    new Winston.transports.File({
      filename: Path.join(Config.get("logDir"), "debug.log"),
      maxsize: 40000,
      maxFiles: 10,
      level: Config.get("logLevel"),
      handleExceptions: true,
      prettyPrint: false,
      colorize: false,
      silent: false,
      timestamp: true,
      json: false
    })
  ],
  exitOnError: false
});

module.exports = logger;
