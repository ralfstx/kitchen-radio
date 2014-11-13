
shared.openAlbumPage = function(album) {

  var index;

  var page = tabris.create("Page", {
    title: album.name
  }).on("change:bounds", layout);

  var coverView = tabris.create("ImageView", {
    image: album.icon,
    scaleMode: "fill"
  }).appendTo(page);

  var titleLabel = tabris.create("Label", {
    background: "#cecece"
  }).appendTo(page);

  var playButton = tabris.create("Button", {
    text: "play album",
  }).on("selection", play).appendTo(page);

  page.open();

  $.getJSON(config.SERVER + "/albums/" + album.path + "/index.json", function(result) {
    index = result;
    update();
  });

  function update() {
    page.set("title", index.name || "unknown album");
    titleLabel.set("text", getTracks().join("\n"));
  }

  function play() {
    var url = config.SERVER + "/replace";
    var data = getTracks().map(function(track) {
      return config.SERVER + "/albums/" + album.path + "/" + encodeURIComponent(track);
    });
    $.post(url, JSON.stringify(data));
  }

  function getTracks() {
    if ("discs" in index) {
      return Array.prototype.concat.apply([], index.discs.map(function(disc) {
        return disc.tracks.map(function(track) {
          return disc.path + "/" + track;
        });
      }));
    }
    return index.tracks.map(function(track) {
      return track.path;
    });
  }

  function layout() {
    var bounds = page.get("bounds");
    var coverSize = Math.floor(Math.min(bounds.width, bounds.height) / 2);
    if (bounds.width > bounds.height) {
      // landscape
      playButton.set("layoutData", {left: 10, top: 10});
      coverView.set("layoutData", {left: 10, centerY: 0, width: coverSize, height: coverSize});
      titleLabel.set("layoutData", {left: [coverView, 10], top: 10, right: 10, bottom: 10});
    } else {
      // portrait
      playButton.set("layoutData", {right: 10, top: 10});
      coverView.set("layoutData", {centerX: 0, top: 10, width: coverSize, height: coverSize});
      titleLabel.set("layoutData", {left: 10, top: [coverView, 10], right: 10, bottom: 10});
    }
  }

};
