import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import LiteralObject from './literal-object.mjs';
import BaseObject from './shared/base-object.mjs';
import assignObject from './utils/assign-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/schema-object/union-type',
  $schema: 'http://json-schema.org/draft-07/schema#',
  oneOf: [
    {
      properties: {
        oneOf: {
          type: 'array',
        },
      },
      required: ['oneOf'],
      type: 'object',
    },
    {
      properties: {
        enum: {
          type: 'array',
        },
      },
      required: ['enum'],
      type: 'object',
    },
  ],
});

export default class UnionObject extends BaseObject {
  #objects;

  constructor(definition, owner) {
    super(definition, owner);

    this.#objects =
      'enum' in definition
        ? definition.enum.map(dep => new LiteralObject(dep, this))
        : definition.oneOf.map(schema => assignObject(schema, this));
  }

  static schema = SCHEMA;

  build() {
    return t.tsUnionType(this.#objects.map(object => object.build()));
  }
}
