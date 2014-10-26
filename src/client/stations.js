
tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Radio Stations",
    topLevel: true
  });

  var stationsList = tabris.create("List", {
    linesVisible: true,
    layoutData: {left: 0, right: 0, top: 0, bottom: 0},
    itemHeight: 60,
    template: [
      {
        type: "image",
        binding: "icon",
        scaleMode: "FILL",
        left: 0, top: 0, width: 120, height: 60
      }, {
        type: "text",
        binding: "name",
        left: 130, right: 10, top: 5, bottom: 5,
        foreground: "rgb(74, 74, 74)"
      }
    ],
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
