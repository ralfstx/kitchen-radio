
shared.openAlbumPage = function(album) {

  var page = tabris.create("Page", {
    title: album.name
  }).on("resize", layout);

  var coverView = tabris.create("ImageView", {
    image: album.icon,
    scaleMode: "fill"
  }).appendTo(page);

  tabris.create("Button", {
    text: "play album",
    layoutData: {left: 20, bottom: 20}
  }).on("selection", function() {
    $.getJSON(config.SERVER + "/play/" + album.path + "/album.m3u", function() {
    });
  }).appendTo(page);

  page.open();

  $.getJSON(config.SERVER + "/albums/" + album.path + "/info", function(result) {
  });

  function layout() {
    var bounds = page.get("bounds");
    var coverSize = Math.floor(Math.min(bounds.width, bounds.height) / 2);
    if (bounds.width > bounds.height) {
      // landscape
      coverView.set("layoutData", {left: 20, centerY: 0, width: coverSize, height: coverSize});
    } else {
      // portrait
      coverView.set("layoutData", {centerX: 0, top: 20, width: coverSize, height: coverSize});
    }
  }

};
