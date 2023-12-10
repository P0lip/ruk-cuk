import { isPlainObject } from '@stoplight/json';

import { toPascalCase } from '../../utils/strings.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';
import { assignForeignObject } from '../shared/foreign-object.mjs';
import JsonReferenceObject from '../shared/json-reference-object.mjs';
import SchemaObject from './schema-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/parameter-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  oneOf: [
    {
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
    },
    { $ref: '../json-reference-object#' },
  ],
});

export default class ParameterObject extends BaseObject {
  #object;
  #definition;

  constructor(definition, owner) {
    super(definition, owner);

    this.name = '';
    this.#definition = definition;

    if (!('$ref' in definition)) {
      this.name = toPascalCase(definition.name);
      const schema = {
        additionalProperties: false,
        id: definition.name,
        properties: {
          [definition.name]: isPlainObject(definition.schema)
            ? {
                deprecated: definition.deprecated,
                description: definition.description,
                ...definition.schema,
              }
            : {
                deprecated: definition.deprecated,
                description: definition.description,
              },
        },
        required: definition.required === true ? [definition.name] : [],
        type: 'object',
      };

      this.#object = new SchemaObject(schema, this, this.name);
    } else {
      this.#object = new JsonReferenceObject(
        definition,
        this.resolver.isForeign(definition.$ref)
          ? assignForeignObject(definition, owner)
          : this,
      );

      this.resolver.resolveDocumentFragment(definition.$ref, () => {
        //
      });
    }
  }

  get definitionName() {
    return this.#definition.name;
  }

  get in() {
    if (this.#object instanceof JsonReferenceObject) {
      return this.#object.resolvedFragment?.in;
    }

    return this.#definition.in;
  }

  static schema = SCHEMA;

  build() {
    return BaseObject.build(this.#object);
  }

  static create(definition) {
    return new ParameterObject(definition, this);
  }
}
