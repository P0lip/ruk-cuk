import { assertValidDefinition } from '../../validation/ajv.mjs';

export default class BaseObject {
  #definition;
  #path;
  #root;

  constructor(definition, subpath, owner) {
    BaseObject.#assertValidDefinition(definition, this);

    this.#definition = definition;
    this.subpath = subpath;
    this.owner = owner;

    BaseObject.#store.set(definition, this);
  }

  static #store = new WeakMap();

  static retrieveObject(definition) {
    return BaseObject.#store.get(definition);
  }

  static #assertValidDefinition(definition, owner) {
    const schema = Object.getPrototypeOf(owner).constructor.schema;
    if (schema !== void 0) {
      assertValidDefinition(definition, schema);
    }
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
