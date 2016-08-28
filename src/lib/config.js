import values from '../config.json';

function get(name) {
  return values[name];
}

export default {get};
