import { isPlainObject } from '@stoplight/json';

import Scope from '../codegen/scope.mjs';
import { toSnakePascalCase } from '../utils/strings.mjs';
import { assertValidDefinition, registerSchema } from '../validation/ajv.mjs';
import ParameterObject from './parameter-object.mjs';
import PathItemObject from './path-item-object.mjs';
import RequestBodyObject from './request-body-object.mjs';
import ResponseObject from './response-object.mjs';
import SchemaObject from './schema-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    components: {
      properties: {
        parameters: {
          additionalProperties: {
            oneOf: [
              { $ref: './parameter-object#' },
              { $ref: './reference-object#' },
            ],
          },
          type: 'object',
        },
        responses: {
          additionalProperties: {
            oneOf: [
              { $ref: './response-object#' },
              { $ref: './reference-object#' },
            ],
          },
          type: 'object',
        },
        schemas: {
          additionalProperties: {
            oneOf: [
              { $ref: './schema-object#' },
              { $ref: './reference-object#' },
            ],
          },
          type: 'object',
        },
      },
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

    this.scope = Scope.register(this);

    this.owner = this;
    this.document = definition;
    this.#definition = definition;

    this.name = toSnakePascalCase(definition.info.title);

    this.components = this.#getComponentsObjectContents();
    this.pathItems = this.#getPathItemObjects();
  }

  static schema = SCHEMA;

  dispose() {
    Scope.unregister(this);
  }

  #getComponentsObjectContents() {
    const { components } = this.#definition;
    if (!isPlainObject(components)) return [];

    const objects = [];

    if ('parameters' in components) {
      for (const [key, definition] of Object.entries(components.parameters)) {
        objects.push(
          new ParameterObject(
            definition,
            ['components', 'parameters', key],
            this,
          ),
        );
      }
    }

    if ('schemas' in components) {
      for (const [key, definition] of Object.entries(components.schemas)) {
        objects.push(
          new SchemaObject(definition, ['components', 'schemas', key], this),
        );
      }
    }

    if ('responses' in components) {
      for (const [key, definition] of Object.entries(components.responses)) {
        objects.push(
          new ResponseObject(
            definition,
            ['components', 'responses', key],
            this,
          ),
        );
      }
    }

    if ('requestBodies' in components) {
      for (const [key, definition] of Object.entries(
        components.requestBodies,
      )) {
        objects.push(
          new RequestBodyObject(
            definition,
            ['components', 'requestBodies', key],
            this,
          ),
        );
      }
    }

    return objects;
  }

  #getPathItemObjects() {
    const pathItems = [];

    for (const [key, definition] of Object.entries(this.#definition.paths)) {
      pathItems.push(new PathItemObject(definition, key, this));
    }

    return pathItems;
  }

  *[Symbol.iterator]() {
    yield* this.pathItems.values();
    yield* this.components.values();
  }
}
