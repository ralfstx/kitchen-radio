var $ = require("./lib/jquery.min.js");
var config = require("./config.js");

require("./player.js").createPage().open();
require("./stations.js").createPage();
require("./albums.js").createPage();

tabris.create("Action", {
  "title": "Stop"
}).on("selection", function() {
  $.get(config.SERVER + "/stop");
});
