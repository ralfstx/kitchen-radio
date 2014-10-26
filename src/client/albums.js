
tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Collection",
    topLevel: true
  });

  var albumsList = tabris.create("List", {
    linesVisible: true,
    layoutData: {left: 0, right: 0, top: 0, bottom: 0},
    itemHeight: 60,
    template: [
      {
        type: "image",
        binding: "icon",
        scaleMode: "FILL",
        left: 0, top: 0, width: 60, height: 60
      }, {
        type: "text",
        binding: "name",
        left: 130, right: 10, top: 5, bottom: 5,
        foreground: "rgb(74, 74, 74)"
      }
    ],
  }).on("selection", function(event) {
    openAlbum(event.item);
  }).appendTo(page);

  $.getJSON(config.SERVER + "/albums", function(albums) {
    showAlbums(albums);
  });

  function showAlbums(albums) {
    albumsList.set("items", albums.map(function(item) {
      return {
        name: item.name,
        stream: item.stream,
        path: config.SERVER + "/albums/" + item.path,
        icon: {src: config.SERVER + "/albums/" + item.path + "/cover.jpg", width: 300, height: 300}
      };
    }));
  }

  function openAlbum(album) {
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

  }


});
