import { registerSchema } from '../validation/ajv.mjs';
import BaseObject from './abstract/base-object.mjs';
import OperationObject from './operation-object.mjs';
import ParameterObject from './parameter-object.mjs';
import ReferenceObject from './reference-object.mjs';

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
  $id: 'ruk-cuk/path-item-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  patternProperties: {
    [`^(${HTTP_VERBS.join('|')})$`]: {
      $ref: './operation-object#',
    },
  },
  properties: {
    parameters: {
      items: {
        oneOf: [
          { $ref: './parameter-object#' },
          { $ref: './reference-object#' },
        ],
      },
      type: 'array',
    },
    summary: true,
  },
  type: 'object',
});

export default class PathItemObject extends BaseObject {
  constructor(definition, path, owner) {
    super(definition, ['paths', path], owner);

    this.name = path;
    this.parameters =
      definition.parameters?.map(PathItemObject.#processParameter, this) ?? [];
    this.operations = Object.keys(definition)
      .filter(PathItemObject.#isHttpVerb)
      .map(verb => new OperationObject(definition[verb], verb, this));
  }

  static schema = SCHEMA;

  static #isHttpVerb(key) {
    return HTTP_VERBS.includes(key.toLowerCase());
  }

  static #processParameter(parameterObjectOrReferenceObject, i) {
    const subpath = ['parameters', String(i)];
    if ('$ref' in parameterObjectOrReferenceObject) {
      return new ReferenceObject(
        parameterObjectOrReferenceObject,
        subpath,
        this,
      );
    }

    return new ParameterObject(parameterObjectOrReferenceObject, subpath, this);
  }
}
