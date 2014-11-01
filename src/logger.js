
var Path = require("path");
var Winston = require("winston");

var Config = require("./config");

var logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: "debug",
      colorize: true
    }),
    new Winston.transports.File({
      filename: Path.join(Config.logDir, "debug.log"),
      handleExceptions: true,
      level: "debug",
      json: false
    })
  ],
  exitOnError: false
});

module.exports = logger;
