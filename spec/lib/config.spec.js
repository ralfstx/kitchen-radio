var Config = require("../../src/lib/config");

describe("config", function() {

  describe("get", function() {

    it("returns existing values", function() {
      expect(Config.get("port")).toBe(8080);
    });

    it("returns undefined for non-existing values", function() {
      expect(Config.get("not-existing")).not.toBeDefined();
    });

  });

});
