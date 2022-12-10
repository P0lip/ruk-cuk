import * as t from '@babel/types';

import Resolver from '../../codegen/resolver.mjs';
import Scope from '../../codegen/scope.mjs';
import { capitalize, toSnakePascalCase } from '../../utils/strings.mjs';
import {
  assertValidDefinition,
  registerSchema,
} from '../../validation/ajv.mjs';
import assignObject from './utils/assign-object.mjs';

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

export default class JSONSchemaObject {
  #rootSchema;
  #defs;

  constructor(definition, owner, name = definition.title) {
    assertValidDefinition(definition, JSONSchemaObject.schema);

    this.definition = definition;
    this.scope = owner?.scope ?? Scope.register(this);
    this.resolver = owner?.resolver ?? new Resolver(definition);
    // this.$draft = 'draft-7';
    this.context = owner?.context ?? 'readWrite';

    this.owner = this;

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

  dispose() {
    Scope.unregister(this);
  }

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
