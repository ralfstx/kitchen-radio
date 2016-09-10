import values from '../config.json';

function get(name, def) {
  if (!(name in values)) {
    if (arguments.length < 2) {
      throw new Error('No such config value: ' + name);
    }
    return def;
  }
  return values[name];
}

function set(name, value) {
  return values[name] = value;
}

export default {get, set};
