/*
 * Utility methods for hash functions.
 */
import Crypto from 'crypto';
import CRC32 from 'crc-32';
import {createReadStream} from 'fs-extra';

export function sha1Str(string) {
  if (!(typeof string === 'string')) {
    throw new Error('Not a string: ' + string);
  }
  let hash = Crypto.createHash('sha1');
  hash.update(string);
  return hash.digest('hex');
}

export function crc32Str(string) {
  if (!(typeof string === 'string')) {
    throw new Error('Not a string: ' + string);
  }
  return hex32(CRC32.str(string));
}

export function sha1File(filename) {
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

export async function crc32File(filename) {
  return new Promise((resolve, reject) => {
    let crc;
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

function hex32(value) {
  let hex = Number((value) >>> 0).toString(16);
  return pad(hex, 8, '0');
}

function pad(str, length, pad) {
  while (str.length < length) {
    str = (pad || ' ') + str;
  }
  return str;
}
