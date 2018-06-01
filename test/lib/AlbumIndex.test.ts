import { mkdir, readFile, readJson, writeJson } from 'fs-extra';
import { join } from 'path';
import { Album } from '../../src/lib/Album';
import { readAlbumFromIndex, writeAlbumIndex } from '../../src/lib/AlbumIndex';
import { Track } from '../../src/lib/Track';
import { TrackList } from '../../src/lib/TrackList';
import { statSafe } from '../../src/lib/files';
import { expect, tmpdir } from '../test';

describe('AlbumIndex', function() {

  describe('createAlbumFromIndex', function() {

    it('creates discs and tracks', function() {
      let album = readAlbumFromIndex('foo', {
        discs: [{
          path: '01',
          tracks: [{path: '01.ogg'}, {path: '02.ogg'}]
        }, {
          path: '02',
          tracks: [{path: '01.ogg'}, {path: '02.ogg'}]
        }]
      });

      expect(album.discs.length).to.equal(2);
      expect(album.tracks.length).to.equal(4);
      expect(album.tracks[0].path).to.equal('foo/01/01.ogg');
    });

    it('handles discs without path', function() {
      let album = readAlbumFromIndex('foo', {
        discs: [{
          tracks: [{path: '01.ogg'}, {path: '02.ogg'}]
        }]
      });

      expect(album.discs.length).to.equal(1);
      expect(album.tracks.length).to.equal(2);
      expect(album.tracks[0].path).to.equal('foo/01.ogg');
    });

    it('creates disc for tracks on root level', function() {
      let album = readAlbumFromIndex('foo', {
        tracks: [{path: '01.ogg'}, {path: '02.ogg'}]
      });

      expect(album.discs.length).to.equal(1);
      expect(album.tracks.length).to.equal(2);
      expect(album.tracks[0].path).to.equal('foo/01.ogg');
    });

  });

  describe('writeAlbumIndex', function() {

    let baseDir: string;
    let indexFile: string;
    const albumPath = 'album';

    beforeEach(function() {
      baseDir = tmpdir();
      mkdir(join(baseDir, albumPath));
      indexFile = join(baseDir, albumPath, 'index.json');
    });

    it('creates index file', async function() {
      let discs = [new TrackList([])];
      let album = new Album(discs, {});

      await writeAlbumIndex(indexFile, album, albumPath);

      let stats = await statSafe(indexFile);
      expect(stats).not.to.be.null;
    });

    it('merges with existing index file', async function() {
      let data = {tags: ['foo', 'bar']};
      let discs = [new TrackList([])];
      let album = new Album(discs, data);
      await writeJson(indexFile, {extra: 23});

      await writeAlbumIndex(indexFile, album, albumPath);

      let written = await readJson(indexFile);
      expect(written).to.deep.include({extra: 23, tags: ['foo', 'bar']});
    });

    it('deletes existing tracks (they are copied into a disc)', async function() {
      let discs = [new TrackList([])];
      let album = new Album(discs, {});
      await writeJson(indexFile, {tracks: [{path: '01.ogg'}]});

      await writeAlbumIndex(indexFile, album, albumPath);

      let written = await readJson(indexFile);
      expect(written).to.not.include.any.keys('tracks');
    });

    it('removes deleted tags', async function() {
      let discs = [new TrackList([])];
      let album = new Album(discs, {});
      await writeJson(indexFile, {tags: ['foo', 'bar']});

      await writeAlbumIndex(indexFile, album, albumPath);

      let written = await readJson(indexFile);
      expect(written).to.not.include.any.keys('tags');
    });

    it('creates correct structure', async function() {
      let discs = [new TrackList([new Track(join(albumPath, '01.ogg'), {title: 'Sheep'})])];
      let album = new Album(discs, {artist: 'Pink Floyd', title: 'Animals'});

      await writeAlbumIndex(indexFile, album, albumPath);

      let written = await readJson(indexFile);
      expect(written).to.deep.equal({
        name: 'Pink Floyd - Animals',
        artist: 'Pink Floyd',
        title: 'Animals',
        discs: [{
          tracks: [{
            path: '01.ogg',
            title: 'Sheep',
            length: 0
          }]
        }]
      });
    });

    it('creates members in predefined order', async function() {
      let discs = [new TrackList([new Track(join(albumPath, '01.ogg'), {title: 'Sheep'})])];
      let album = new Album(discs, {artist: 'Pink Floyd', title: 'Animals'});
      await writeJson(indexFile, {foo: 23, bar: 42});

      await writeAlbumIndex(indexFile, album, albumPath);

      let written = await readFile(indexFile, 'utf8');
      expect(written.split(/\n/)).to.deep.equal([
        '{',
        ' "name": "Pink Floyd - Animals",',
        ' "artist": "Pink Floyd",',
        ' "title": "Animals",',
        ' "discs": [',
        '  {',
        '   "tracks": [',
        '    {',
        '     "path": "01.ogg",',
        '     "title": "Sheep",',
        '     "length": 0',
        '    }',
        '   ]',
        '  }',
        ' ],',
        ' "bar": 42,',
        ' "foo": 23',
        '}'
      ]);
    });

  });

});
