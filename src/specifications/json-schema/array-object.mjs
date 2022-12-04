// prefixItems
// items
// unevaluatedItems

import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from './shared/base-object.mjs';
import assignObject from './utils/assign-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema-draft-7/array-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    items: {
      oneOf: [
        {
          type: 'object',
        },
        {
          type: 'boolean',
        },
      ],
    },
    maxItems: {
      type: 'number',
    },
    minItems: {
      type: 'number',
    },
    type: {
      const: 'array',
    },
  },
  required: ['type'],
  type: 'object',
});

export default class ArrayObject extends BaseObject {
  #object;
  #minItems;

  constructor(definition, owner) {
    super(definition, owner);

    this.#object = assignObject(definition.items, this);
    this.#minItems = definition.minItems ?? 0;
  }

  static schema = SCHEMA;

  build() {
    const object = this.#object.build();
    if (this.#minItems > 0) {
      return t.tsTupleType([
        ...new Array(this.#minItems).fill(object),
        t.tsRestType(t.tsArrayType(object)),
      ]);
    }

    return t.tsArrayType(object);
  }
}
