import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema/boolean-schema-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'boolean',
});

export default class BooleanSchemaObject extends BaseObject {
  #value;

  constructor(definition, owner) {
    super(definition, owner);

    this.#value = definition;
  }

  static schema = SCHEMA;

  build() {
    return this.#value === false ? t.tsNeverKeyword() : t.tsUnknownKeyword();
  }
}
