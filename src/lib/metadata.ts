import { createReadStream } from 'fs-extra';
import * as musicmeta from 'musicmetadata';

const supportedItems = {
  title: 'title',
  artist: 'artist',
  album: 'albumTitle',
  albumartist: 'albumArtist'
};

export async function getTrackMetadata(file: string): Promise<AudioFileMetadata> {
  let fileMetadata = await readMetaDataFromFile(file);
  let metadata = {} as AudioFileMetadata;
  for (let name in supportedItems) {
    let value = asString(fileMetadata[name]);
    if (value) {
      metadata[supportedItems[name]] = value;
    }
  }
  if (fileMetadata.duration) {
    metadata.length = Math.round(fileMetadata.duration);
  }
  return metadata;
}

function readMetaDataFromFile(file: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let stream = createReadStream(file);
    stream.on('error', reject);
    musicmeta(stream, {duration: true}, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

function asString(value) {
  return Array.isArray(value) ? value.join(', ') : value;
}

interface AudioFileMetadata {
  title?: string;
  artist?: string;
  album?: string;
  albumartist?: string;
  length?: number;
}
