import { isHoistable } from '../../codegen/utils/guards.mjs';
import { assertValidDefinition } from '../../validation/ajv.mjs';

export default class BaseObject {
  #root;
  #name;

  constructor(definition, owner) {
    BaseObject.#assertValidDefinition(definition, this);
    this.owner = owner;
    this.scope = owner.scope;
    this.cache = owner.cache;
    this.tree = owner.tree;
    this.resolver = owner.resolver;
  }

  static #assertValidDefinition(definition, owner) {
    const schema = Object.getPrototypeOf(owner).constructor.schema;
    if (schema !== void 0) {
      assertValidDefinition(definition, schema);
    }
  }

  get name() {
    if (this.#name === void 0) {
      let _owner = this;

      do {
        _owner = _owner.owner;
        if (_owner.name !== void 0) {
          this.#name = `_${_owner.name}`.replace(/^_{2,}/, '_');
          break;
        }
      } while ('owner' in _owner && _owner.owner !== _owner);
    }

    return this.#name;
  }

  set name(value) {
    this.#name = value;
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

  attachTsDocBlock(node) {
    return node;
  }

  static buildHoistedObject(object) {
    const built = BaseObject.build(object);
    if (!isHoistable(built)) {
      return built;
    }

    object.scope.store(object);
    return object.tree.hoist(object.scope.load(object), built);
  }

  static build(object) {
    let built = object.cache.get(object);
    if (built === void 0) {
      built = object.build();
      object.cache.set(object, built);
    }

    return built;
  }
}
