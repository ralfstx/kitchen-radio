var Http = require("http");

var Config = require("../../src/lib/config");
var Server = require("../../src/lib/server");

describe("server", () => {

  var port = Config.get("port");

  beforeEach(done => {
    Server.clearHandlers();
    Server.start().then(done, done.fail);
  });

  afterEach(done => {
    Server.stop().then(done, done.fail);
    Server.clearHandlers();
  });

  describe("start", () => {

    it("returns port when started", done => {
      Server.stop()
        .then(() => Server.start())
        .then(result => expect(result).toBe(port))
        .then(done, done.fail);
    });

    it("returns false when already running", done => {
      Server.start()
        .then(() => Server.start())
        .then(result => expect(result).toBe(false))
        .then(done, done.fail);
    });

  });

  describe("addHandler", () => {

    it("ignores non-objects", () => {
      expect(() => {
        Server.addHandlers();
        Server.addHandlers(23);
        Server.addHandlers(false);
      }).not.toThrow();
    });

  });

  describe("added handler for 'foo'", () => {

    var handler;

    beforeEach(() => {
      handler = createSpyHandler();
      Server.addHandlers({
        "foo": handler
      });
    });

    it("receives '/foo'", done => {
      request("/foo").then(() => {
        expect(handler).toHaveBeenCalled();
      }).then(done, done.fail);
    });

    it("receives '/foo/'", done => {
      request("/foo/").then(() => {
        expect(handler).toHaveBeenCalled();
      }).then(done, done.fail);
    });

    it("receives '/foo/bar'", done => {
      request("/foo/bar").then(() => {
        expect(handler).toHaveBeenCalled();
      }).then(done, done.fail);
    });

  });

  describe("request", () => {

    it("without matching handler returns 404", done => {
      request("/foo").then(response => {
        expect(response.statusCode).toBe(404);
      }).then(done, done.fail);
    });

  });

  function createSpyHandler() {
    return jasmine.createSpy("handler").and.callFake((request, response) => {
      Server.writeJson(response, {});
    });
  }

  function request(path) {
    return new Promise((resolve, reject) => {
      Http.get("http://localhost:" + port + path, resolve).on("error", reject);
    });
  }

});
