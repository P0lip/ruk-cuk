import { isPlainObject } from '@stoplight/json';

import { toPascalCase } from '../utils/strings.mjs';
import BaseObject from './abstract/base-object.mjs';
import SchemaObject from './schema-object.mjs';
import { registerSchema } from './validation/ajv.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/parameter-object',
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
  constructor(definition, subpath, owner) {
    super(definition, subpath, owner);

    this.name = toPascalCase(definition.name);
    this.in = definition.in;

    const schema = {
      additionalProperties: false,
      id: definition.name,
      properties: {
        [definition.name]: isPlainObject(definition.schema)
          ? definition.schema
          : {}, // could be true, but IIRC it's not supported by json-schema-to-typescript
      },
      required: definition.required === true ? [definition.name] : [],
      type: 'object',
    };

    this.schema = new SchemaObject(schema, ['schema'], this);
    this.schema.name = this.name;
  }

  static schema = SCHEMA;
}
