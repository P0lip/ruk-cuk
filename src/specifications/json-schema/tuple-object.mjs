import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import assignObject from './schema-utils/assign-object.mjs';
import BaseObject from './shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema-draft-7/tuple-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    items: {
      type: 'array',
    },
    type: {
      const: 'array',
    },
  },
  required: ['type'],
  type: 'object',
});

export default class TupleObject extends BaseObject {
  #objects;

  constructor(definition, owner) {
    super(definition, owner);

    this.#objects = definition.items.map(item => assignObject(item, this));
  }

  static schema = SCHEMA;

  build() {
    return t.tsTupleType(this.#objects.map(BaseObject.build));
  }
}
