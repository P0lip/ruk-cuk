import * as t from '@babel/types';

import OpenAPITree from '../../codegen/openapi-tree.mjs';
import { toSnakePascalCase } from '../../utils/strings.mjs';
import {
  assertValidDefinition,
  registerSchema,
} from '../../validation/ajv.mjs';
import DocumentObject from '../shared/document-object.mjs';
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
          // pattern: '^[A-Za-z\\s]{4,}$',
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
  required: ['info'],
  type: 'object',
});

export default class OpenAPIObject extends DocumentObject {
  #definition;

  constructor(sourceDocument, resolver, tree) {
    super(sourceDocument, resolver, tree);

    const { definition } = sourceDocument;
    assertValidDefinition(definition, OpenAPIObject.schema);

    this.owner = this;
    this.#definition = definition;

    this.name = toSnakePascalCase(definition.info.title);
    this.tree.name = this.name;

    this.components = new ComponentsObject(definition.components ?? {}, this);
    this.pathItems =
      tree instanceof OpenAPITree ? this.#getPathItemObjects() : [];
  }

  static schema = SCHEMA;

  #getPathItemObjects() {
    const pathItems = [];

    if ('paths' in this.#definition) {
      for (const definition of Object.values(this.#definition.paths)) {
        pathItems.push(new PathItemObject(definition, this));
      }
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

    return t.program(this.tree.nodes);
  }

  toString() {
    this.build();

    return this.tree.toString();
  }
}
