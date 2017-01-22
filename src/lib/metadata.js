import musicmeta from 'musicmetadata';
import {createReadStream} from './fs-async';

export async function getTrackMetadata(file) {
  let fileMetadata = await readMetaDataFromFile(file);
  let metadata = {};
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

function readMetaDataFromFile(file) {
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
