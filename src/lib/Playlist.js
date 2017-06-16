export function isPlaylist(url) {
  return url.endsWith('.m3u') || url.endsWith('.m3u8') || url.endsWith('.pls');
}

export function readFiles(text) {
  let tracks = [];
  let lines = text.split(/\n/).map(line => line.trim());
  let isPls = false;
  for (let line of lines) {
    if (line === '[playlist]') {
      isPls = true;
    }
    if (line.startsWith('#') || line === '') {
      continue;
    }
    if (isPls) {
      if (/^File\d+\s*=/.test(line)) {
        tracks.push(line.replace(/^File\d+\s*=\s*/, ''));
      }
    } else {
      tracks.push(line);
    }
  }
  return tracks;
}
