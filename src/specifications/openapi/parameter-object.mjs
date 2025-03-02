import * as t from '@babel/types';
import { isPlainObject } from '@stoplight/json';

import {
  COOKIE_PARAM_HELPER,
  HEADER_PARAM_HELPER,
  PATH_PARAM_HELPER,
  QUERY_PARAM_HELPER,
} from '../../codegen/utils/ruk-cuk-helpers.mjs';
import { extractRukCukNameExtension } from '../../utils/extensions.mjs';
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

const HELPERS_MATCH = {
  cookie: COOKIE_PARAM_HELPER,
  header: HEADER_PARAM_HELPER,
  path: PATH_PARAM_HELPER,
  query: QUERY_PARAM_HELPER,
};

export default class ParameterObject extends BaseObject {
  #object;

  constructor(definition, owner) {
    super(definition, owner);

    const name = extractRukCukNameExtension(definition) ?? definition.name;
    this.name = toPascalCase(name);
    this.in = definition.in;

    owner.tree.needsImportHelpers = true;

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
  }

  static schema = SCHEMA;

  build() {
    const program = structuredClone(BaseObject.build(this.#object));
    for (const child of program.body) {
      if (child.type !== 'TSTypeAliasDeclaration') continue;
      const typeAnnotation = child.typeAnnotation;
      if (typeAnnotation.type !== 'TSTypeLiteral') continue;
      for (const member of typeAnnotation.members) {
        member.typeAnnotation.typeAnnotation = t.tsTypeReference(
          HELPERS_MATCH[this.in],
          t.tsTypeParameterInstantiation([
            member.typeAnnotation.typeAnnotation,
          ]),
        );
      }
    }

    return program;
  }
}
