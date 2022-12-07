import {
  pathToPointer,
  pointerToPath,
  resolveInlineRef,
} from '@stoplight/json';
import * as assert from 'node:assert';

import { registerSchema } from '../validation/ajv.mjs';
import BaseObject from './abstract/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/reference-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    $ref: {
      type: 'string',
    },
  },
  required: ['$ref'],
  type: 'object',
});

export default class ReferenceObject extends BaseObject {
  #_resolved;
  #reference;

  constructor(definition, subpath, owner) {
    super(definition, subpath, owner);

    this.#reference = definition.$ref;
  }

  get #resolved() {
    return (this.#_resolved ??= ReferenceObject.retrieveObject(
      this.document,
      this.#reference,
    ));
  }

  get referencedObject() {
    return this.#resolved.referencedObject;
  }

  get name() {
    return this.#resolved.name;
  }

  static schema = SCHEMA;

  static retrieveObject(document, $ref) {
    const path = pointerToPath($ref);
    const propertyPath = [];
    let targetObject;

    do {
      targetObject = BaseObject.retrieveObject(
        resolveInlineRef(document, pathToPointer(path)),
      );

      propertyPath.push(`['${path.pop()}']`);
    } while (path.length > 0 && targetObject === void 0);

    propertyPath.pop();

    assert.ok(
      targetObject !== void 0,
      new ReferenceError(`Could not resolve $ref ${$ref}.`),
    );

    if (propertyPath.length === 0) {
      return {
        name: targetObject.name,
        referencedObject: targetObject,
      };
    }

    return {
      name: targetObject.name + propertyPath.reverse().join(''),
      referencedObject: targetObject,
    };
  }
}
