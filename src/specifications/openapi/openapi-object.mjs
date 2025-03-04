import Scope from '../../codegen/scope.mjs';
import Resolver from '../../core/resolver.mjs';
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
        pattern: '^\\/',
      },
      type: 'object',
    },
  },
  required: ['info', 'paths'],
  type: 'object',
});

export default class OpenAPIObject {
  #definition;

  constructor({ definition }, tree) {
    assertValidDefinition(definition, OpenAPIObject.schema);

    this.document = definition;
    this.tree = tree;
    this.cache = new Map();
    this.scope = Scope.register(this);
    this.resolver = new Resolver(definition);

    this.owner = this;
    this.#definition = definition;

    this.name = toSnakePascalCase(definition.info.title);
    this.tree.name = this.name;

    this.components = new ComponentsObject(definition.components ?? {}, this);
    this.pathItems = this.#getPathItemObjects();
  }

  static schema = SCHEMA;

  dispose() {
    this.cache.clear();
    Scope.unregister(this);
  }

  #getPathItemObjects() {
    const pathItems = [];

    for (const definition of Object.values(this.#definition.paths)) {
      pathItems.push(new PathItemObject(definition, this));
    }

    return pathItems;
  }

  build() {
    const nodes = [...this.pathItems, this.components];

    for (const object of nodes) {
      if (object instanceof PathItemObject) {
        for (const operationObject of object.operations) {
          this.tree.addOperationObject(operationObject);
        }
      } else {
        this.tree.addObject(object);
      }
    }
  }

  toString() {
    this.build();

    return this.tree.toString();
  }
}
