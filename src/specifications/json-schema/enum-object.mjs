import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import LiteralObject from './literal-object.mjs';
import BaseObject from './shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/schema-object/enum-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    enum: {
      type: 'array',
    },
  },
  required: ['enum'],
  type: 'object',
});

export default class EnumObject extends BaseObject {
  #objects;

  constructor(definition, owner) {
    super(definition, owner);

    this.#objects = definition.enum.map(dep => new LiteralObject(dep, this));
  }

  static schema = SCHEMA;

  build() {
    return t.tsUnionType(this.#objects.map(BaseObject.build));
  }
}
