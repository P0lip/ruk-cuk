import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from './shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema/boolean-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    type: {
      const: 'boolean',
    },
  },
  required: ['type'],
  type: 'object',
});

export default class BooleanObject extends BaseObject {
  static schema = SCHEMA;

  build() {
    return t.tsBooleanKeyword();
  }
}
