import { isPlainObject } from '@stoplight/json';

import { toPascalCase } from '../../utils/strings.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';
import SchemaObject from './schema-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/parameter-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    in: {
      enum: ['query', 'header', 'path', 'cookie'],
    },
    name: {
      pattern: '^[A-Za-z]',
      type: 'string',
    },
    required: {
      type: 'boolean',
    },
    schema: {
      $ref: './schema-object',
    },
  },
  required: ['in', 'name'],
  type: 'object',
});

export default class ParameterObject extends BaseObject {
  #object;

  constructor(definition, owner) {
    super(definition, owner);

    this.name = toPascalCase(definition.name);
    this.in = definition.in;

    const schema = {
      additionalProperties: false,
      id: definition.name,
      properties: {
        [definition.name]: isPlainObject(definition.schema)
          ? definition.schema
          : true,
      },
      required: definition.required === true ? [definition.name] : [],
      type: 'object',
    };

    this.#object = new SchemaObject(schema, this, this.name);
  }

  static schema = SCHEMA;

  build() {
    return BaseObject.build(this.#object);
  }
}
