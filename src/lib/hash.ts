import * as CRC32 from 'crc-32';
import * as Crypto from 'crypto';
import { createReadStream } from 'fs-extra';

/*
 * Utility methods for hash functions.
 */

export function sha1Str(string: string): string {
  let hash = Crypto.createHash('sha1');
  hash.update(string);
  return hash.digest('hex');
}

export function crc32Str(string: string): string {
  return hex32(CRC32.str(string));
}

export function sha1File(filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let hash = Crypto.createHash('sha1');
    let stream = createReadStream(filename);
    stream.on('data', (data) => {
      hash.update(data);
    });
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

export function crc32File(filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let crc: number;
    let stream = createReadStream(filename);
    stream.on('data', (data) => {
      crc = CRC32.buf(data, crc);
    });
    stream.on('end', () => {
      resolve(hex32(crc));
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

function hex32(value: number) {
  // tslint:disable-next-line:no-bitwise
  let hex = Number((value) >>> 0).toString(16);
  return pad(hex, 8, '0');
}

function pad(str: string, length: number, padStr: string) {
  while (str.length < length) {
    str = (padStr || ' ') + str;
  }
  return str;
}
