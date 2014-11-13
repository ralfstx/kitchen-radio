
shared.openAlbumPage = function(album) {

  var index;

  var page = tabris.create("Page", {
    title: album.name
  }).on("change:bounds", layout);

  var coverView = tabris.create("ImageView", {
    image: album.icon,
    scaleMode: "fill"
  }).appendTo(page);

  var trackListView = tabris.create("CollectionView", {
    itemHeight: 25,
    initializeCell: function(cell) {
      var label = tabris.create("Label", {
        layoutData: {left: 10, right: 10, top: 1, bottom: 1}
      }).appendTo(cell);
      cell.on("itemchange", function(track) {
        label.set("text", track.name || track.path);
      });
    }
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
    trackListView.set("items", getTracks());
  }

  function play() {
    var url = config.SERVER + "/replace";
    var data = getTracks().map(function(track) {
      return config.SERVER + "/albums/" + album.path + "/" + encodeURIComponent(track.path);
    });
    $.post(url, JSON.stringify(data));
  }

  function getTracks() {
    if ("discs" in index) {
      return Array.prototype.concat.apply([], index.discs.map(function(disc) {
        return disc.tracks.map(function(track) {
          track.path = disc.path + "/" + track.path;
          return track;
        });
      }));
    }
    return index.tracks;
  }

  function layout() {
    var bounds = page.get("bounds");
    var coverSize = Math.floor(bounds.width / 3);
    if (bounds.width > bounds.height) {
      // landscape
      trackListView.set("layoutData", {left: 10, top: 10, bottom: 10, right: [30, 10]});
      playButton.set("layoutData", {right: 10, top: 10});
      coverView.set("layoutData", {right: 10, bottom: 10, width: coverSize, height: coverSize});
    } else {
      // portrait
      coverView.set("layoutData", {left: 10, top: 10, width: coverSize, height: coverSize});
      playButton.set("layoutData", {right: 10, top: 10});
      trackListView.set("layoutData", {left: 10, top: [coverView, 10], right: 10, bottom: 10});
    }
  }

};
