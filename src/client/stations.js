var $ = require("./lib/jquery.min.js");
var config = require("./config");

exports.createPage = function() {

  var page = tabris.create("Page", {
    title: "Radio Stations",
    topLevel: true
  });

  var stationsList = tabris.create("CollectionView", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0},
    itemHeight: 60,
    initializeCell: function(cell) {
      var iconView = tabris.create("ImageView", {
        layoutData: {left: 0, top: 0, width: 120, height: 60},
        scaleMode: "fill"
      }).appendTo(cell);
      var nameView = tabris.create("TextView", {
        layoutData: {left: 130, right: 10, top: 5, bottom: 5},
        foreground: "rgb(74, 74, 74)"
      }).appendTo(cell);
      cell.on("itemchange", function(item) {
        iconView.set("image", item.icon);
        nameView.set("text", item.name);
      });
    }
  }).on("selection", function(event) {
    tuneIn(event.item);
  }).appendTo(page);

  $.getJSON(config.server + "/files/stations", function(stations) {
    showStations(stations);
  });

  function showStations(stations) {
    stationsList.set("items", stations.map(function(item) {
      return {
        name: item.name,
        stream: item.stream,
        icon: {src: config.server + "/files/stations/" + item.icon, width: 300, height: 300}
      };
    }));
  }

  function tuneIn(station) {
    $.getJSON(config.server + "/play/" + station.stream, function() {
    });
  }

  return page;

};
