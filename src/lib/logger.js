
var Path = require("path");
var Winston = require("winston");

var Config = require("./config");

var logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: "trace",
      handleExceptions: true,
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: false
    }),
    new Winston.transports.File({
      filename: Path.join(Config.logDir, "debug.log"),
      maxsize: 40000,
      maxFiles: 10,
      level: "debug",
      handleExceptions: true,
      prettyPrint: false,
      colorize: true,
      silent: false,
      timestamp: true,
      json: false
    })
  ],
  exitOnError: false
});

module.exports = logger;
