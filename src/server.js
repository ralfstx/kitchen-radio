var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");
var Http = require("http");
var Url = require("url");

var Config = require("./lib/config.js");
var Logger = require("./lib/logger");
var Files = require("./lib/files");

var mimetypes = {
  // text
  ".txt": "text/plain; charset=UTF-8",
  ".html": "text/html; charset=UTF-8",
  // image
  ".gif": "image/gif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  // audio
  ".mp3": "audio/mpeg",
  ".flac": "audio/flac",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  // binary
  ".json": "application/json; charset=UTF-8",
  ".js": "application/javascript",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
  ".zip": "application/zip",
  ".gz": "application/gzip",
  // other
  other: "application/octet-stream"
};

function getMimeType(filename) {
  return mimetypes[Path.extname(filename)] || mimetypes.other;
}

exports.start = start;
exports.addHandler = addHandler;
exports.readBody = readBody;
exports.writeFile = writeFile;
exports.writeJson = writeJson;

var handlers = {
  "": function(request, response) {
    writeJson(response, {message: "Hello!"});
  }
};

function start() {
  Http.createServer(handleRequest).listen(Config.port);
  Logger.info("Started on port %d", Config.port);
}

function addHandler(prefix, handler) {
  var old = handlers[prefix];
  handlers[prefix] = handler;
  return old;
}

function handleRequest(request, response) {
  return Promise.resolve().then(function() {
    var urlpath = getUrlPath(request);
    Logger.debug("request %s", urlpath);
    var parts = splitPath(urlpath);
    var handler = handlers[parts[0]];
    if (handler) {
      return handler(request, response, parts[1]);
    } else {
      writeJson(response, {error: "Not Found: " + parts[0]}, 404);
    }
  }).catch(function(err) {
    Logger.error(err.stack || err.message || err);
    writeJson(response, {error: err.message}, 500);
  });
}

function getUrlPath(request) {
  return decodeURIComponent(Url.parse(request.url).pathname).substr(1);
}

function splitPath(path) {
  var start = (path.substr(0, 1) === "/") ? 1 : 0;
  var index = path.indexOf("/", start);
  var head = path.substr(start, index === -1 ? path.length : index);
  var tail = index === -1 ? "" : path.substr(index + 1, path.length);
  return [head, tail];
}

function readBody(request) {
  return new Promise(function(resolve, reject) {
    var body = "";
    request.on("data", function (data) {
      body += data;
    });
    request.on("end", function () {
      resolve(body);
    });
    request.on("error", function (err) {
      reject(err);
    });
  });
}

function writeFile(response, filepath) {
  var path = Path.normalize(filepath);
  if (path.indexOf("../") !== -1) {
    throw new Error("Illegal path '" + path + "'");
  }
  return Files.statAsyncSafe(path).then(function(stats) {
    if (!stats) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.end("Not Found: " + path + "\n");
      throw new Error("Not Found: " + path + "\n");
    } else if (!stats.isFile()) {
      response.writeHead(403, {"Content-Type": "text/plain"});
      response.end("Not a File: " + path + "\n");
      throw new Error("Not a File: " + path + "\n");
    } else {
      response.writeHead(200, {"Content-Type": getMimeType(path)});
      // omit Content-Length header to enable chunked transfer encoding
      // response.writeHead(200, {'Content-Length': stats.size});
      Fs.createReadStream(path).pipe(response);
    }
  });
}

function writeJson(response, data, code) {
  response.writeHead(code || 200, {"Content-Type": "application/json; charset: utf-8"});
  response.end(JSON.stringify(data, null, " "));
}
