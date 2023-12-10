import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';
import OperationObject from './operation-object.mjs';
import ParameterObject from './parameter-object.mjs';

const HTTP_VERBS = [
  'get',
  'head',
  'post',
  'put',
  'delete',
  'patch',
  'connect',
  'options',
  'trace',
  'patch',
];

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/path-item-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  patternProperties: {
    [`^(${HTTP_VERBS.join('|')})$`]: {
      $ref: './operation-object#',
    },
  },
  properties: {
    parameters: {
      items: { $ref: './parameter-object#' },
      type: 'array',
    },
    summary: true,
  },
  type: 'object',
});

export default class PathItemObject extends BaseObject {
  constructor(definition, owner) {
    super(definition, owner);

    this.name = '';
    this.parameters =
      'parameters' in definition
        ? definition.parameters.map(ParameterObject.create, this)
        : [];
    this.operations = Object.keys(definition)
      .filter(PathItemObject.#isHttpVerb)
      .map(verb => new OperationObject(definition[verb], this));
  }

  static schema = SCHEMA;

  static #isHttpVerb(key) {
    return HTTP_VERBS.includes(key.toLowerCase());
  }
}
