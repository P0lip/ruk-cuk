import * as assert from 'node:assert';

import { resolveInlineRef } from '@stoplight/json';

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
    const targetObject = this.load(resolveInlineRef(this.#document, $ref));

    assert.ok(
      targetObject !== void 0,
      new ReferenceError(`Could not resolve $ref ${$ref}.`),
    );

    return targetObject;
  }

  store(definition, object) {
    this.#store.set(definition, object);
  }
}
