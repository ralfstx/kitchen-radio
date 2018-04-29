import { createReadStream } from 'fs-extra';
import * as musicmeta from 'musicmetadata';

export async function getTrackMetadata(file: string): Promise<AudioFileMetadata> {
  let fileMetadata = await readMetaDataFromFile(file);
  let metadata = {} as AudioFileMetadata;
  for (let name of ['title', 'artist', 'album', 'albumartist']) {
    let value = fileMetadata[name];
    let valueStr = Array.isArray(value) ? value.join(', ') : value;
    if (valueStr) {
      metadata[name] = valueStr;
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

interface AudioFileMetadata {
  title?: string;
  artist?: string;
  album?: string;
  albumartist?: string;
  length?: number;
}
