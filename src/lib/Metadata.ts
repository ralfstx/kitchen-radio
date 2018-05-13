import { createReadStream } from 'fs-extra';
import * as musicMeta from 'musicmetadata';

const supportedItems: {[key: string]: string} = {
  title: 'title',
  artist: 'artist',
  album: 'albumTitle',
  albumartist: 'albumArtist'
};

export class Metadata {

  public static async getTrackMetadata(file: string): Promise<AudioFileMetadata> {
    let fileMetadata = await readMetaDataFromFile(file);
    let metadata = {} as any;
    for (let name in supportedItems) {
      let value = asString(fileMetadata[name]);
      if (value) {
        metadata[supportedItems[name] as string] = value;
      }
    }
    if (fileMetadata.duration) {
      metadata.length = Math.round(fileMetadata.duration);
    }
    return metadata;
  }

}

function readMetaDataFromFile(file: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let stream = createReadStream(file);
    stream.on('error', reject);
    musicMeta(stream, {duration: true}, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

function asString(value: any) {
  return Array.isArray(value) ? value.join(', ') : value;
}

export interface AudioFileMetadata {
  title?: string;
  artist?: string;
  albumTitle?: string;
  albumArtist?: string;
  length?: number;
}
