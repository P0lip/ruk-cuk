import * as t from '@babel/types';

import merge from '../../codegen/utils/merge.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import assignObject from './schema-utils/assign-object.mjs';
import BaseObject from './shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/schema-object/union-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  anyOf: [
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
        anyOf: {
          type: 'array',
        },
      },
      required: ['anyOf'],
      type: 'object',
    },
  ],
});

export default class UnionObject extends BaseObject {
  #objects;

  constructor(definition, keyword, owner) {
    super(definition, owner);

    this.#objects = definition[keyword].map(schema =>
      assignObject(schema, this),
    );
  }

  static schema = SCHEMA;

  build() {
    return merge(t.tsUnionType(this.#objects.map(BaseObject.build)));
  }
}
