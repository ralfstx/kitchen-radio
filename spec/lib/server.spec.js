var Server = require("../../src/lib/server");

describe("server", function() {

  describe("addHandler", function() {

    it("ignores non-objects", function() {
      expect(() => {
        Server.addHandlers();
        Server.addHandlers(23);
        Server.addHandlers(false);
      }).not.toThrow();
    });

  });

});
