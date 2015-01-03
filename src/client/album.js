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
      var numberLabel = tabris.create("Label", {
        layoutData: {left: 10, width: 30, top: 5, bottom: 5},
        font: "15px sans-serif",
        alignment: "right"
      }).appendTo(cell);
      var titleLabel = tabris.create("Label", {
        layoutData: {left: 45, right: 85, top: 5, bottom: 5},
        font: "15px sans-serif"
      }).appendTo(cell);
      var timeLabel = tabris.create("Label", {
        layoutData: {right: 10, width: 70, top: 5, bottom: 5},
        font: "15px sans-serif",
        alignment: "right"
      }).appendTo(cell);
      cell.on("itemchange", function(item) {
        if (item.type === "track") {
          numberLabel.set("text", item.number + ".");
          titleLabel.set("text", item.title || item.path);
          titleLabel.set("font", "15px sans-serif");
        } else {
          numberLabel.set("text", "");
          var isMulti = item.album.discs.length > 1;
          titleLabel.set("text", isMulti ? "Disc " + item.number : "");
          titleLabel.set("font", "bold 18px sans-serif");
        }
        timeLabel.set("text", formatLength(item.length));
      });
    }
  }).on("selection", function(event) {
    var item = event.item;
    if (item.type === "track") {
      play([item]);
    } else {
      play(item.tracks);
    }
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
    trackListView.set("items", getItems());
  }

  function play(tracks) {
    var url = config.SERVER + "/replace";
    $.post(url, JSON.stringify(tracks.map(getTrackUrl)));
  }

  function getCoverImage() {
    return {src: config.SERVER + "/albums/" + album.path + "/cover-250.jpg", width: 250, height: 250};
  }

  function getTrackUrl(track) {
    function notEmpty(value) { return !!value; }
    var parts = [album.path, track.disc && track.disc !== track.album ? track.disc.path : "", track.path];
    return config.SERVER + "/albums/" + parts.filter(notEmpty).map(encodeURIComponent).join("/");
  }

  function getItems() {
    var items = [];
    if (album) {
      album.discs = album.discs || [album];
      album.discs.forEach(function(disc, index) {
        disc.album = album;
        disc.number = index + 1;
        disc.type = "disc";
        items.push(disc);
        if (disc.tracks) {
          disc.tracks.forEach(function(track, index) {
            track.album = album;
            track.disc = disc;
            track.number = index + 1;
            track.type = "track";
          });
          items = items.concat(disc.tracks);
        }
      });
    }
    return items;
  }

  function getTracks() {
    return getItems().filter(function(item) {
      return item.type === "track";
    });
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

  function formatLength(seconds) {
    if (!seconds) {
      return "";
    }
    function pad(n) {
      return n < 10 ? "0" + n : "" + n;
    }
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds - (m * 60));
    return m + ":" + pad(s);
  }

  return page;

};
