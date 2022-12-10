import Resolver from '../../codegen/resolver.mjs';
import Scope from '../../codegen/scope.mjs';
import { toSnakePascalCase } from '../../utils/strings.mjs';
import {
  assertValidDefinition,
  registerSchema,
} from '../../validation/ajv.mjs';
import ComponentsObject from './components-object.mjs';
import PathItemObject from './path-item-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/openapi-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    components: {
      type: 'object',
    },
    info: {
      properties: {
        title: {
          pattern: '^[A-Za-z\\s]{4,}$',
          type: 'string',
        },
      },
      required: ['title'],
      type: 'object',
    },
    paths: {
      additionalProperties: {
        $ref: './path-item-object',
      },
      propertyNames: {
        pattern: '^\\/.',
      },
      type: 'object',
    },
  },
  required: ['info', 'paths'],
  type: 'object',
});

export default class OpenAPIObject {
  #definition;

  constructor(definition) {
    assertValidDefinition(definition, OpenAPIObject.schema);

    this.document = definition;
    this.scope = Scope.register(this);
    this.resolver = new Resolver(definition);

    this.owner = this;
    this.#definition = definition;

    this.name = toSnakePascalCase(definition.info.title);

    this.components = new ComponentsObject(definition.components ?? {}, this);
    this.pathItems = this.#getPathItemObjects();
  }

  static schema = SCHEMA;

  dispose() {
    Scope.unregister(this);
  }

  #getPathItemObjects() {
    const pathItems = [];

    for (const definition of Object.values(this.#definition.paths)) {
      pathItems.push(new PathItemObject(definition, this));
    }

    return pathItems;
  }

  *[Symbol.iterator]() {
    yield* this.pathItems.values();
    yield this.components;
  }
}
