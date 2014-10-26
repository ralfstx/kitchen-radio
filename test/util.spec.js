var util = require("../src/util");

console.log(util);
describe("util", function() {

  describe("walk", function() {

    var log, fn, callback, error;

    beforeEach(function() {
      log = [];
      fn = function(element, next) {
        log.push(element);
        next();
      };
      callback = jasmine.createSpy("callback");
      error = new Error("test");
    });

    it("walks over all elements", function() {
      util.walk([1, 2, 3, 4], fn, callback);
      expect(log).toEqual([1, 2, 3, 4]);
    });

    it("error in function is passed to the callback", function() {
      util.walk([1, 2, 3, 4], function() {
        throw error;
      }, callback);
      expect(callback).toHaveBeenCalledWith(error);
    });

    it("error can be returned in next function", function() {
      util.walk([1, 2, 3, 4], function(item, next) {
        next(error);
      }, callback);
      expect(callback).toHaveBeenCalledWith(error);
    });

    it("error can be returned in next function", function() {
      util.walk([1, 2, 3, 4], function(item, next) {
        log.push(item);
        next(null);
      }, callback);
      expect(log).toEqual([1, 2, 3, 4]);
      expect(callback).toHaveBeenCalled();
    });

  });

});
