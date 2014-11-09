
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
