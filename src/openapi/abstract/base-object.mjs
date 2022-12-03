import { assertValidDefinition } from '../../validation/ajv.mjs';

export default class BaseObject {
  #definition;
  #root;

  constructor(definition, owner) {
    BaseObject.#assertValidDefinition(definition, this);

    this.#definition = definition;
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
