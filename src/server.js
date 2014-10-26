var Fs = require("fs");
var Path = require("path");
var Util = require("./util");

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
  ".json": "application/json",
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

exports.writeFile = function(response, filepath) {
  var path = Path.normalize(filepath);
  if (path.indexOf("..") !== -1) {
    throw new Error("Illegal path " + path);
  }
  Fs.exists(path, function(exists) {
    if (exists) {
      Fs.stat(path, function(err, stats) {
        if (stats.isFile()) {
          response.writeHead(200, {"Content-Type": getMimeType(path)});
          // omit Content-Length header to enable chunked transfer encoding
          // response.writeHead(200, {'Content-Length': stats.size});
          Fs.createReadStream(path).pipe(response);
        } else {
          response.writeHead(403, {"Content-Type": "text/plain"});
          response.end("Not a File: " + path + "\n");
        }
      });
    } else {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.end("Not Found: " + path + "\n");
    }
  });
};

exports.writeJson = function(response, data, code) {
  response.writeHead(code || 200, {"Content-Type": "application/json; charset: utf-8"});
  response.end(JSON.stringify(data, null, " "));
};

exports.safeRunner = function(response) {
  return Util.safeRunner(function(err) {
    /*global console: false */
    console.error("ERROR", err.stack ? err.stack : err.message, "\n");
    response.writeHead(500, {"Content-Type": "application/json; charset: utf-8"});
    response.end(JSON.stringify({error: "Internal Server Error"}, null, " "));
  });
};
