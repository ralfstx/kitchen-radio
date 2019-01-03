import { isPlaylist, readPlaylist } from '../../src/lib/Playlists';
import { expect } from '../test';

describe('playlist', function() {

  describe('isPlaylist', function() {

    it('recognizes playlist by file extension', async function() {
      expect(isPlaylist('')).to.be.false;
      expect(isPlaylist('foo.bar')).to.be.false;
      expect(isPlaylist('foo/m3u')).to.be.false;
      expect(isPlaylist('foo.m3u')).to.be.true;
      expect(isPlaylist('foo.m3u8')).to.be.true;
      expect(isPlaylist('foo.pls')).to.be.true;
    });

  });

  describe('readPlaylist', function() {

    it('recognizes simple PLS playlist', async function() {
      let content = [
        '[playlist]',
        'Title1=Here enter name of the station',
        'File1=http://example.com:8080/',
        'NumberOfEntries=1'
      ].join('\n');

      expect(readPlaylist(content)).to.deep.equal(['http://example.com:8080/']);
    });

    it('recognizes PLS playlist with multiple files', async function() {
      let content = [
        '[playlist]',
        '',
        'File1=http://example.com:8080',
        'Length1=-1',
        '',
        'File2=example2.mp3',
        'Title2=Just some local audio that is 2mins long',
        'Length2=120',
        '',
        'NumberOfEntries=2',
        'Version=2'
      ].join('\n');

      expect(readPlaylist(content)).to.deep.equal(['http://example.com:8080', 'example2.mp3']);
    });

    it('recognizes simple M3U playlist', async function() {
      let content = [
        '#EXT-X-VERSION:3',
        '#EXTM3U',
        '#EXTINF:-1, Example Radio Station',
        'https://streaming.example.com/listen'
      ].join('\n');

      expect(readPlaylist(content)).to.deep.equal(['https://streaming.example.com/listen']);
    });

  });

});
