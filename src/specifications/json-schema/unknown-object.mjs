import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from './shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema/numeric-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    exclusiveMaximum: {
      type: 'number',
    },
    exclusiveMinimum: {
      type: 'number',
    },
    maximum: {
      type: 'number',
    },
    minimum: {
      type: 'number',
    },
    multipleOf: {
      type: 'number',
    },
    type: {
      enum: ['number', 'integer'],
    },
  },
  required: ['type'],
  type: 'object',
});

export default class NumericObject extends BaseObject {
  static schema = SCHEMA;

  constructor(definition, owner) {
    super(definition, owner);

    this.description = definition.description ?? null;
  }

  build() {
    return t.tsNumberKeyword();
  }
}
