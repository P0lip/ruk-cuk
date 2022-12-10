import { isPlainObject } from '@stoplight/json';

import combineNodes from '../../codegen/utils/combine-nodes.mjs';
import { capitalize } from '../../utils/strings.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';
import ResponseObject from './response-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/responses-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  additionalProperties: {
    $ref: './response-object',
  },
  allOf: [
    {
      if: {
        properties: {
          '2XX': true,
        },
        required: ['2XX'],
      },
      then: {
        patternProperties: {
          '2[0-9]{2}': false,
        },
      },
    },
    {
      if: {
        properties: {
          '3XX': true,
        },
        required: ['3XX'],
      },
      then: {
        patternProperties: {
          '3[0-9]{2}': false,
        },
      },
    },
  ],
  propertyNames: {
    pattern: '^(default|[1-5]XX|[1-5][0-9]{2})$',
  },
  type: 'object',
});

export default class ResponsesObject extends BaseObject {
  #objects;

  constructor(definition, owner) {
    super(definition, owner);

    this.name = this.scope.generateUnique(`${capitalize(owner.name)}Response`);
    this.scope.store(this);
    this.#objects = isPlainObject(definition)
      ? this.#getSuccessResponses(definition)
      : [];
  }

  static schema = SCHEMA;

  get #filteredObjects() {
    return this.#objects.filter(ResponsesObject.#hasBody);
  }

  get size() {
    return this.#filteredObjects.length;
  }

  build() {
    return combineNodes(
      this.#filteredObjects.flatMap(response => response.build()),
      'tsUnionType',
      this.name,
    );
  }

  static #isSuccessResponse(code) {
    const parsed = Number.parseInt(code);
    return !Number.isNaN(parsed) && parsed >= 200 && parsed < 400;
  }

  static #hasBody(referenceObject) {
    return !referenceObject.hasNoSchema;
  }

  #getSuccessResponses(responses) {
    const responseObjects = [];
    if ('2XX' in responses) {
      responseObjects.push(new ResponseObject(responses['2XX'], this, '2XX'));
    }

    if ('3XX' in responses) {
      responseObjects.push(new ResponseObject(responses['3XX'], this, '3XX'));
    }

    responseObjects.push(
      ...Object.keys(responses)
        .filter(ResponsesObject.#isSuccessResponse)
        .map(code => new ResponseObject(responses[code], this, code)),
    );

    return responseObjects;
  }
}
