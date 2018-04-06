export default class Context {

  /**
   * Creates a new context object with read-only members.
   * @param {{}} values an object to initialize the context
   */
  constructor(values) {
    for (let name in values) {
      this.set(name, values[name]);
    }
  }

  set(name, value) {
    Object.defineProperty(this, name, {enumerable: true, value});
  }

}
