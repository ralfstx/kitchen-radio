import { readFile, readJson, writeJson } from 'fs-extra';
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

    let dir: string;

    beforeEach(function() {
      dir = tmpdir();
    });

    it('creates index file', async function() {
      let discs = [new TrackList([])];
      let album = new Album(discs, {});

      await writeAlbumIndex(dir, album);

      let stats = await statSafe(join(dir, 'index.json'));
      expect(stats).not.to.be.null;
    });

    it('merges with existing index file', async function() {
      let data = {tags: ['foo', 'bar']};
      let discs = [new TrackList([])];
      let album = new Album(discs, data);
      await writeJson(join(dir, 'index.json'), {extra: 23});

      await writeAlbumIndex(dir, album);

      let written = await readJson(join(dir, 'index.json'));
      expect(written).to.deep.include({extra: 23, tags: ['foo', 'bar']});
    });

    it('deletes existing tracks (they are copied into a disc)', async function() {
      let discs = [new TrackList([new Track('01.ogg')])];
      let album = new Album(discs, {});
      await writeJson(join(dir, 'index.json'), {tracks: [{path: '01.ogg'}]});

      await writeAlbumIndex(dir, album);

      let written = await readJson(join(dir, 'index.json'));
      expect(written).to.not.include.any.keys('tracks');
    });

    it('creates correct structure', async function() {
      let discs = [new TrackList([new Track('01.ogg', {title: 'Sheep'})])];
      let album = new Album(discs, {artist: 'Pink Floyd', title: 'Animals'});

      await writeAlbumIndex(dir, album);

      let written = await readJson(join(dir, 'index.json'));
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
      let discs = [new TrackList([new Track('01.ogg', {title: 'Sheep'})])];
      let album = new Album(discs, {artist: 'Pink Floyd', title: 'Animals'});
      await writeJson(join(dir, 'index.json'), {foo: 23, bar: 42});

      await writeAlbumIndex(dir, album);

      let written = await readFile(join(dir, 'index.json'), 'utf8');
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
