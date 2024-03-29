import * as t from '@babel/types';

import merge from '../../codegen/utils/merge.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import assignObject from './schema-utils/assign-object.mjs';
import BaseObject from './shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema/intersection-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    allOf: {
      type: 'array',
    },
  },
  required: ['allOf'],
  type: 'object',
});

export default class IntersectionObject extends BaseObject {
  #objects;

  constructor(definition, owner) {
    super(definition, owner);

    this.#objects = definition.allOf.map(schema => assignObject(schema, this));
  }

  static schema = SCHEMA;

  build() {
    return merge(t.tsIntersectionType(this.#objects.map(BaseObject.build)));
  }
}
