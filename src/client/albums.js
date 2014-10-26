
tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Collection",
    topLevel: true
  });

  var filterText = tabris.create("Text", {
    layoutData: {left: 0, right: 0, top: 0},
    message: "filter"
  }).on("modify", showAlbums).appendTo(page);

  var albumsList = tabris.create("List", {
    linesVisible: true,
    layoutData: {left: 0, right: 0, top: [filterText, 0], bottom: 0},
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

  var albums;

  $.getJSON(config.SERVER + "/albums", function(result) {
    albums = result.map(function(item) {
      return {
        name: item.name,
        stream: item.stream,
        path: config.SERVER + "/albums/" + item.path,
        icon: {src: config.SERVER + "/albums/" + item.path + "/cover-250.jpg", width: 250, height: 250}
      };
    });
    showAlbums();
  });


  function showAlbums() {
    var filter = filterText.get("text");
    if (filter) {
      albumsList.set("items", albums.filter(function(album) {
        return album.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
      }).slice(0, 20));
    } else {
      albumsList.set("items", _.shuffle(albums).slice(0, 20));
    }
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
