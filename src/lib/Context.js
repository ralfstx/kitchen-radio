export default class Context {

  constructor(values) {
    for (let name in values) {
      this.set(name, values[name]);
    }
  }

  set(name, value) {
    Object.defineProperty(this, name, {enumerable: true, value});
  }

}
