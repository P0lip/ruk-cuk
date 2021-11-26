export default class BaseObject {
  #definition;
  #path;
  #root;

  constructor(definition, subpath, owner) {
    this.#definition = definition;
    this.subpath = subpath;
    this.owner = owner;

    BaseObject.#store.set(definition, this);
  }

  static #store = new WeakMap();

  static retrieveObject(definition) {
    return BaseObject.#store.get(definition);
  }

  get path() {
    if (!this.owner.path) {
      return this.subpath;
    }

    return (this.#path ??= [...this.owner.path, ...this.subpath]);
  }

  get scope() {
    return this.root.scope;
  }

  get root() {
    if (this.#root === void 0) {
      let _owner = this;
      do {
        _owner = _owner.owner;
      } while ('owner' in _owner && _owner.owner !== _owner);

      this.#root = _owner;
    }

    return this.#root;
  }

  get document() {
    return this.root.document;
  }
}
