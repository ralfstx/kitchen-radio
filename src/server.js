var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var Path = require("path");
var Http = require("http");
var Url = require("url");

var Config = require("./lib/config");
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
  return Promise.resolve(mimetypes[Path.extname(filename)] || mimetypes.other);
}

exports.start = start;
exports.addHandler = addHandler;
exports.readBody = readBody;
exports.writeFile = writeFile;
exports.writeJson = writeJson;
exports.createError = createError;
exports.createFileHandler = createFileHandler;

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
    Logger.error("HTTP " + (err.httpCode || 500), err.stack || err.message || err);
    writeJson(response, {error: err.message}, err.httpCode || 500);
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
  var realpath = Path.normalize(filepath);
  if (realpath.indexOf("../") !== -1) {
    throw new Error("Illegal path '" + filepath + "'");
  }
  return Files.statAsyncSafe(realpath).then(function(stats) {
    if (!stats) {
      throw createError(404, "Not Found: '" + filepath + "'");
    } else if (!stats.isFile()) {
      throw createError(403, "Not a File: '" + filepath + "'");
    } else {
      return writeExistingFile(response, realpath);
    }
  });
}

function createFileHandler(dir) {
  return function(request, response, path) {
    var realPath = Path.normalize(Path.join(dir, path));
    if (realPath.split("/").indexOf("..") !== -1) {
      throw new Error("Illegal path '" + path + "'");
    }
    return Files.statAsyncSafe(realPath).then(function(stats) {
      if (stats && stats.isFile()) {
        return writeExistingFile(response, realPath);
      }
      if (stats && stats.isDirectory()) {
        var indexPath = Path.join(realPath, "index.json");
        return Files.statAsyncSafe(indexPath).then(function(stats) {
          if (stats && stats.isFile()) {
            return writeExistingFile(response, indexPath);
          }
          throw createError(403, "Forbidden: " + path);
        });
      }
      throw createError(404, "Not Found: " + path);
    });
  };
}

function writeExistingFile(response, path) {
  return getMimeType(path).then(function(mimeType) {
    response.setHeader("Content-Type", mimeType);
  }).then(function() {
    // omit Content-Length header to enable chunked transfer encoding
    // response.setHeader("Content-Length": stats.size);
    var stream = Fs.createReadStream(path);
    return new Promise(function(resolve, reject) {
      stream.on("end", resolve).on("error", reject);
      stream.pipe(response);
    }).catch(function(err) {
      if (err.code && err.code === "EACCES") {
        throw createError(403, "Forbidden");
      }
      throw err;
    });
  });
}

function writeJson(response, data, httpCode) {
  response.statusCode = httpCode || 200;
  response.setHeader("Content-Type", "application/json; charset: utf-8");
  response.end(JSON.stringify(data, null, " "));
}

function createError(httpCode, message) {
  var error = new Error(message);
  error.httpCode = httpCode;
  return error;
}
