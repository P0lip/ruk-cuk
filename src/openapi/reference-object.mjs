import {
  pathToPointer,
  pointerToPath,
  resolveInlineRef,
} from '@stoplight/json';
import * as assert from 'node:assert';

import BaseObject from './base-object.mjs';

export default class ReferenceObject extends BaseObject {
  constructor(definition, subpath, owner) {
    super(definition, subpath, owner);

    this.referencedObject = ReferenceObject.retrieveObject(
      owner.document,
      definition.$ref,
    );

    this.name = this.referencedObject.name;
  }

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
