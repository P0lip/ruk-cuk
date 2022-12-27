import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import assignObject from '../json-schema/schema-utils/assign-object.mjs';
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
  #$ref;

  constructor(definition, owner) {
    super(definition, owner);

    this.#$ref = definition.$ref;
  }

  static schema = SCHEMA;

  get referencedObject() {
    try {
      return this.resolver.resolveObject(this.#$ref);
    } catch {
      return null;
    }
  }

  build() {
    const { referencedObject } = this;
    if (referencedObject === null) {
      return assignObject(
        this.resolver.resolveDocumentFragment(this.#$ref),
        this,
      ).build();
    }

    return t.tsTypeReference(t.identifier(referencedObject.name));
  }
}
