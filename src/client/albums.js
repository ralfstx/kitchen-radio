
tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Collection",
    topLevel: true
  });

  var filterText = tabris.create("Text", {
    layoutData: {left: 0, right: 0, top: 0},
    message: "filter"
  }).on("modify", showAlbums).appendTo(page);

  var albumsList = tabris.create("CollectionView", {
    layoutData: {left: 0, right: 0, top: [filterText, 0], bottom: 0},
    itemHeight: 60,
    initializeCell: function(cell) {
      var iconView = tabris.create("ImageView", {
        layoutData: {left: 0, top: 0, width: 60, height: 60},
        scaleMode: "fill"
      }).appendTo(cell);
      var nameLabel = tabris.create("Label", {
        layoutData: {left: 80, right: 10, top: 5, bottom: 5},
        foreground: "rgb(74, 74, 74)"
      }).appendTo(cell);
      cell.on("itemchange", function(item) {
        iconView.set("image", item.icon);
        nameLabel.set("text", item.name);
      });
    }
  }).on("selection", function(event) {
    shared.openAlbumPage(event.item);
  }).appendTo(page);

  var albums;

  $.getJSON(config.SERVER + "/albums", function(result) {
    albums = result.map(function(item) {
      return {
        name: item.name,
        path: item.path,
        url: config.SERVER + "/albums/" + item.path,
        icon: {src: config.SERVER + "/albums/" + item.path + "/cover-250.jpg", width: 250, height: 250}
      };
    });
    showAlbums();
  });

  function showAlbums() {
    var filter = filterText.get("text");
    if (filter) {
      albumsList.set("items", albums.filter(function(album) {
        return (album.name || "").toLowerCase().indexOf(filter.toLowerCase()) !== -1;
      }).slice(0, 20));
    } else {
      albumsList.set("items", _.shuffle(albums).slice(0, 20));
    }
  }

});
