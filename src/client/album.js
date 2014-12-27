var $ = require("./lib/jquery.min.js");
var _ = require("./lib/underscore-min.js");
var config = require("./config.js");

exports.createAlbumPage = function(album) {

  var page = tabris.create("Page", {
    title: album.name
  }).on("change:bounds", layout);

  var coverView = tabris.create("ImageView", {
    scaleMode: "fill"
  }).appendTo(page);

  var trackListView = tabris.create("CollectionView", {
    itemHeight: 35,
    initializeCell: function(cell) {
      var label = tabris.create("Label", {
        layoutData: {left: 10, right: 10, top: 5, bottom: 5}
      }).appendTo(cell);
      cell.on("itemchange", function(track) {
        label.set("text", track.title || track.path);
      });
    }
  }).on("selection", function(event) {
    var track = event.item;
    play([track]);
  }).appendTo(page);

  var playButton = tabris.create("Button", {
    text: "play album",
  }).on("selection", function() {
    play(getTracks());
  }).appendTo(page);

  $.getJSON(config.SERVER + "/albums/" + album.path + "/index.json", function(result) {
    _.extend(album, result);
    update();
  });

  function update() {
    page.set("title", album.name || "unknown album");
    coverView.set("image", getCoverImage());
    trackListView.set("items", getTracks());
  }

  function play(tracks) {
    var url = config.SERVER + "/replace";
    $.post(url, JSON.stringify(tracks.map(getTrackUrl)));
  }

  function getCoverImage() {
    return {src: config.SERVER + "/albums/" + album.path + "/cover-250.jpg", width: 250, height: 250};
  }

  function getTrackUrl(track) {
    var path  = track.disc ? track.disc.path + "/" + track.path : track.path;
    return config.SERVER + "/albums/" + album.path + "/" + encodeURIComponent(path);
  }

  function getTracks() {
    var tracks = [];
    if (album && album.discs) {
      album.discs.forEach(function(disc) {
        if (disc.tracks) {
          disc.tracks.forEach(function(track) {
            track.disc = disc;
          });
          tracks = tracks.concat(disc.tracks);
        }
      });
    }
    if (album && album.tracks) {
      tracks = tracks.concat(album.tracks);
    }
    return tracks;
  }

  function layout() {
    var bounds = page.get("bounds");
    var coverSize = Math.floor(bounds.width / 3);
    if (bounds.width > bounds.height) {
      // landscape
      trackListView.set("layoutData", {left: 0, top: 0, bottom: 0, right: [66, 5]});
      playButton.set("layoutData", {right: 20, top: 20});
      coverView.set("layoutData", {right: 0, bottom: 0, width: coverSize, height: coverSize});
    } else {
       // portrait
      coverView.set("layoutData", {left: 0, top: 0, width: coverSize, height: coverSize});
      playButton.set("layoutData", {right: 20, top: 20});
      trackListView.set("layoutData", {left: 0, top: coverSize, right: 0, bottom: 0});
    }
  }

  return page;

};
