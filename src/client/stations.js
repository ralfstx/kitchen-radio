
tabris.load(function() {

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
      var nameLabel = tabris.create("Label", {
        layoutData: {left: 130, right: 10, top: 5, bottom: 5},
        foreground: "rgb(74, 74, 74)"
      }).appendTo(cell);
      cell.on("itemchange", function(item) {
        iconView.set("image", item.icon);
        nameLabel.set("text", item.name);
      });
    }
  }).on("selection", function(event) {
    tuneIn(event.item);
  }).appendTo(page);

  $.getJSON(config.SERVER + "/stations", function(stations) {
    showStations(stations);
  });

  function showStations(stations) {
    stationsList.set("items", stations.map(function(item) {
      return {
        name: item.name,
        stream: item.stream,
        icon: {src: config.SERVER + "/stations/" + item.icon, width: 300, height: 300}
      };
    }));
  }
 
  function tuneIn(station) {
    $.getJSON(config.SERVER + "/play/" + station.stream, function() {
    });
  }

});
