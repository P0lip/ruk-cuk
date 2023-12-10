import { extractPointerFromRef } from '@stoplight/json';

import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from './base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-reference-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    $ref: {
      type: 'string',
    },
  },
  required: ['$ref'],
  type: 'object',
});

export default class JsonReferenceObject extends BaseObject {
  ref;

  constructor(definition, owner) {
    super(definition, owner);

    this.ref = extractPointerFromRef(definition.$ref);
  }

  static schema = SCHEMA;

  get referencedObject() {
    try {
      return this.resolver.resolveObject(this.ref);
    } catch (ex) {
      return null;
    }
  }

  get resolvedFragment() {
    try {
      return this.resolver.resolveInlineRef(this.ref);
    } catch {
      return null;
    }
  }

  build() {
    const { referencedObject } = this;
    if (referencedObject === null) {
      throw ReferenceError(`Cannot resolve reference ${this.ref}`);
    }

    return this.tree.bundled.generateAccessPath(referencedObject);
  }
}
