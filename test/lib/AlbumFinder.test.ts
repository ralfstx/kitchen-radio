import { mkdirs, writeFile, writeJson } from 'fs-extra';
import { join } from 'path';
import { SinonSpy } from 'sinon';
import { Album } from '../../src/lib/Album';
import { AlbumFinder } from '../../src/lib/AlbumFinder';
import { Metadata } from '../../src/lib/Metadata';
import { expect, restore, spy, stub, tmpdir } from '../test';
import { AlbumDB } from './AlbumDB';
import { Logger } from './Logger';

describe('AlbumFinder', function() {

  let baseDir: string;
  let albumDB: AlbumDB & {addAlbum: SinonSpy};
  let logger: Logger;
  let albumFinder: AlbumFinder;
  let metadataStub: sinon.SinonStub;

  beforeEach(async function() {
    baseDir = tmpdir();
    logger = { info: spy(), warn: spy() } as any;
    albumDB = { addAlbum: spy() } as any;
    albumFinder = new AlbumFinder({logger, albumDB});
    metadataStub = stub(Metadata, 'getTrackMetadata');
  });

  afterEach(restore);

  it('does nothing on empty directory', async function() {
    await albumFinder.find(baseDir);

    expect(albumDB.addAlbum).to.not.have.been.called;
  });

  it('finds album on first level', async function() {
    let dir = await createDir(baseDir, 'foo');
    await createIndex(dir, {name: 'Foo'});

    await albumFinder.find(baseDir);

    expect(albumDB.addAlbum).to.have.been.calledOnce.and.calledWithMatch({name: 'Foo'});
  });

  it('finds albums on other levels', async function() {
    let dir = await createDir(baseDir, 'foo/bar');
    await createIndex(dir, {name: 'Foo'});

    await albumFinder.find(baseDir);

    expect(albumDB.addAlbum).to.have.been.calledOnce.and.calledWithMatch({name: 'Foo'});
  });

  it('sets paths relative to base dir', async function() {
    let dir = await createDir(baseDir, 'foo');
    await createIndex(dir, {name: 'Foo', discs: [{tracks: [{path: '01.ogg'}]}]});

    await albumFinder.find(baseDir);

    let album = albumDB.addAlbum.firstCall.args[0];
    expect(album.tracks[0].path).to.equal('foo/01.ogg');
  });

  it('finds albums without index', async function() {
    let dir = await createDir(baseDir, 'foo');
    let file = await createFile(dir, '01.mp3');
    metadataStub.withArgs(file).returns({});

    await albumFinder.find(baseDir);

    let album: Album = albumDB.addAlbum.firstCall.args[0];
    expect(album.name).to.equal('Unknown Album');
    expect(album.artist).to.equal('');
    expect(album.tracks).to.have.length(1);
    expect(album.tracks[0].path).to.equal('foo/01.mp3');
  });

  it('finds nested albums without index', async function() {
    let foo = await createDir(baseDir, 'foo');
    let foo1 = await createFile(foo, '01.mp3');
    let bar = await createDir(foo, 'bar');
    let bar1 = await createFile(bar, '01.mp3');
    metadataStub.withArgs(foo1).returns({albumTitle: 'Foo'});
    metadataStub.withArgs(bar1).returns({albumTitle: 'Bar'});

    await albumFinder.find(baseDir);

    expect(albumDB.addAlbum).to.have.been.calledWithMatch({name: 'Foo'});
    expect(albumDB.addAlbum).to.have.been.calledWithMatch({name: 'Bar'});
  });

});

async function createDir(parent: string, name: string) {
  let dir = join(parent, name);
  await mkdirs(dir);
  return dir;
}

async function createIndex(dir: string, index: any) {
  let file = join(dir, 'index.json');
  await writeJson(file, index);
  return file;
}

async function createFile(parent: string, name: string, content = '') {
  let file = join(parent, name);
  await writeFile(file, content);
  return file;
}
