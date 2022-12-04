import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from './shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema/null-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    type: {
      const: 'null',
    },
  },
  required: ['type'],
  type: 'object',
});

export default class NullObject extends BaseObject {
  static schema = SCHEMA;

  build() {
    return t.tsNullKeyword();
  }
}
