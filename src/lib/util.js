export function readProps(data) {
  let props = {};
  if (typeof data === 'string') {
    data.split('\n').forEach((line, index) => {
      if (!/^\s*(#|$)/.test(line)) {
        let match = /^\s*(\S+)\s*:\s*(.*?)\s*$/.exec(line);
        if (!match) {
          throw new Error('Syntax error in line ' + (index + 1));
        }
        props[match[1]] = match[2];
      }
    });
  }
  return props;
}

export function toJson(data) {
  if (!arguments.length) return '';
  return JSON.stringify(data, null, ' ');
}
