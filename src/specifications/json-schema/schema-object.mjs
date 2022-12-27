import * as t from '@babel/types';

import { capitalize, toSnakePascalCase } from '../../utils/strings.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';
import assignObject from './schema-utils/assign-object.mjs';

const SCHEMA = registerSchema({
  $defs: {
    ArrayOfSchemas: {
      items: {
        $ref: '#',
      },
      type: 'array',
    },
    Type: {
      enum: [
        'string',
        'number',
        'integer',
        'boolean',
        'null',
        'array',
        'object',
      ],
    },
  },
  $id: 'ruk-cuk/json-schema',
  $schema: 'http://json-schema.org/draft-07/schema#',
  // we should probably use a meta-schema, but it may be too aggressive
  oneOf: [
    {
      type: 'boolean',
    },
    {
      properties: {
        allOf: {
          $ref: '#/$defs/ArrayOfSchemas',
        },
        anyOf: {
          $ref: '#/$defs/ArrayOfSchemas',
        },
        const: true,
        enum: {
          type: 'array',
        },
        oneOf: {
          $ref: '#/$defs/ArrayOfSchemas',
        },
        type: {
          oneOf: [
            {
              items: {
                $ref: '#/$defs/Type',
              },
              type: 'array',
            },
            {
              $ref: '#/$defs/Type',
            },
          ],
        },
      },
      type: 'object',
    },
  ],
});

export default class JSONSchemaObject extends BaseObject {
  #rootSchema;
  #defs;

  constructor(definition, owner, name = definition.title ?? 'Model') {
    super(definition, owner);

    this.definition = definition;
    this.context = owner?.context ?? 'readWrite';
    this.name = this.scope.generateUnique(toSnakePascalCase(name));
    this.scope.store(this);

    this.#rootSchema = assignObject(definition, this);
    this.#defs = Object.entries(definition.$defs ?? {}).map(
      ([name, definition]) => {
        const schema = assignObject(definition, this.#rootSchema);
        schema.name = this.scope.generateUnique(
          `${this.name}_${capitalize(name)}`,
        );
        this.scope.store(schema);
        this.resolver.store(definition, schema);
        return schema;
      },
    );
  }

  static schema = SCHEMA;

  build() {
    return t.program([
      t.tsTypeAliasDeclaration(
        t.identifier(this.scope.load(this)),
        null,
        this.#rootSchema.build(),
      ),
      ...this.#defs.map(def =>
        t.tsTypeAliasDeclaration(
          t.identifier(this.scope.load(def)),
          null,
          def.build(),
        ),
      ),
    ]);
  }
}
