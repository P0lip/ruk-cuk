import {
  pathToPointer,
  pointerToPath,
  resolveInlineRef,
} from '@stoplight/json';
import * as assert from 'node:assert';

export default class Resolver {
  #document;
  #store;

  constructor(document) {
    this.#document = document;
    this.#store = new WeakMap();
  }

  load(definition) {
    return this.#store.get(definition);
  }

  resolveDocumentFragment($ref) {
    return resolveInlineRef(this.#document, $ref);
  }

  resolveObject($ref) {
    const path = pointerToPath($ref);
    const propertyPath = [];
    let targetObject;

    do {
      targetObject = this.load(
        resolveInlineRef(this.#document, pathToPointer(path)),
      );

      propertyPath.push(String(path.pop()));
    } while (path.length > 0 && targetObject === void 0);

    propertyPath.pop();

    assert.ok(
      targetObject !== void 0,
      new ReferenceError(`Could not resolve $ref ${$ref}.`),
    );

    return {
      name: targetObject.name,
      propertyPath: propertyPath.reverse(),
      referencedObject: targetObject,
    };
  }

  store(definition, object) {
    this.#store.set(definition, object);
  }
}
