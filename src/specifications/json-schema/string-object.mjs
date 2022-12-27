import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from './shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema/string-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    format: {
      type: 'string',
    },
    maxLength: {
      type: 'number',
    },
    minLength: {
      type: 'number',
    },
    pattern: {
      type: 'string',
    },
    type: {
      const: 'string',
    },
  },
  required: ['type'],
  type: 'object',
});

export default class StringObject extends BaseObject {
  static schema = SCHEMA;

  static keywords = Object.keys(SCHEMA.properties);

  build() {
    return t.tsStringKeyword();
  }
}
