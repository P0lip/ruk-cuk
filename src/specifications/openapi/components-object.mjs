import * as t from '@babel/types';
import { isPlainObject } from '@stoplight/json';

import buildObject from '../../codegen/utils/build-object.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';
import ParameterObject from './parameter-object.mjs';
import RequestBodyObject from './request-body-object.mjs';
import ResponseObject from './response-object.mjs';
import SchemaObject from './schema-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/components-object',
  properties: {
    parameters: {
      additionalProperties: {
        $ref: './parameter-object#',
      },
      type: 'object',
    },
    responses: {
      additionalProperties: {
        oneOf: [
          { $ref: './response-object#' },
          { $ref: '../json-reference-object#' },
        ],
      },
      type: 'object',
    },
    schemas: {
      additionalProperties: {
        anyOf: [
          { $ref: './schema-object#' },
          { $ref: '../json-reference-object#' },
        ],
      },
      type: 'object',
    },
  },
  type: 'object',
});

export default class ComponentsObject extends BaseObject {
  #objects;

  constructor(definition, owner) {
    super(definition, owner);

    const objects = [];
    this.#objects = objects;

    const { parameters, schemas, responses, requestBodies } = definition;

    for (const [, definition] of ComponentsObject.#entries(parameters)) {
      objects.push(new ParameterObject(definition, this));
    }

    for (const [key, definition] of ComponentsObject.#entries(schemas)) {
      objects.push(new SchemaObject(definition, this, key));
    }

    for (const [key, definition] of ComponentsObject.#entries(responses)) {
      const uniqueKey = this.scope.generateUnique(key);
      const object = new ResponseObject(definition, this, uniqueKey);
      this.scope.store(object);
      objects.push(object);
    }

    for (const [key, definition] of ComponentsObject.#entries(requestBodies)) {
      const uniqueKey = this.scope.generateUnique(key);
      const object = new RequestBodyObject(definition, this, uniqueKey);
      this.scope.store(object);
      objects.push(object);
    }
  }

  static schema = SCHEMA;

  build() {
    return t.program(this.#objects.flatMap(buildObject));
  }

  static *#entries(definition) {
    if (isPlainObject(definition)) {
      yield* Object.entries(definition);
    }
  }
}
