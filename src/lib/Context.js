export default class Context {

  constructor(values) {
    this._values = values || {};
  }

  get(name, def) {
    if (!(name in this._values)) {
      if (arguments.length < 2) {
        throw new Error('No such value in context: ' + name);
      }
      return def;
    }
    return this._values[name];
  }

  set(name, value) {
    return this._values[name] = value;
  }

}
