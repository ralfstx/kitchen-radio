Kitchen Radio
=============

Code for my remote-controlled RaspberryPi based kitchen radio.

Requirements
------------

* MPD (music player daemon)

REST API
--------

### /albums/update

Update albums index

### /stations/update

Update radio stations index

### /files/

Serve files in music dir, return index.json for directories, e.g.

* /files/albums
* /files/albums/lou-reed-berlin
* /files/albums/lou-reed-berlin/01.ogg
* /files/albums/lou-reed-berlin/cover-100.jpg

### /player/

/player/play
/player/pause
/player/stop
/player/status

License
-------

Code published under the [MIT License](LICENSE).

Test image is from http://upload.wikimedia.org/wikipedia/commons/5/52/Waterberg_Nashorn1.jpg
