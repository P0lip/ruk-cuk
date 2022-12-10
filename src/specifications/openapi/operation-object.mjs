import * as t from '@babel/types';

import { annotatedIdentifier } from '../../codegen/utils/builders.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';
import ParametersVirtualObject from './parameters-virtual-object.mjs';
import ResponsesObject from './responses-object.mjs';

const ID_REGEXP =
  /^(?<namespace>v[0-9]\.[a-zA-Z_-]+)\.(?<action>[a-z][A-Za-z]*)$/;

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/operation-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    operationId: {
      pattern: ID_REGEXP.source,
      type: 'string',
    },
    parameters: {
      items: {
        oneOf: [
          { $ref: './parameter-object#' },
          { $ref: '../json-reference-object#' },
        ],
      },
      type: 'array',
    },
    responses: {
      $ref: './responses-object#',
    },
  },
  required: ['operationId'],
  type: 'object',
});

export default class OperationObject extends BaseObject {
  constructor(definition, owner) {
    super(definition, owner);

    const { action, namespace } = OperationObject.#parseOperationId(
      definition.operationId,
    );
    this.namespace = namespace;
    this.name = action;
    this.parameters = new ParametersVirtualObject(definition, this);
    this.responses = new ResponsesObject(definition.responses ?? {}, this);
  }

  static schema = SCHEMA;

  static #parseOperationId(id) {
    return ID_REGEXP.exec(id).groups;
  }

  build() {
    return t.tsPropertySignature(
      t.identifier(this.name),
      t.tsTypeAnnotation(
        t.tsFunctionType(
          null,
          this.parameters.size === 0
            ? []
            : [
                annotatedIdentifier(
                  'params',
                  t.tsTypeAnnotation(
                    t.tsTypeReference(t.identifier(this.parameters.name)),
                  ),
                ),
              ],
          t.tsTypeAnnotation(
            t.tsTypeReference(
              t.identifier('Promise'),
              t.tsTypeParameterInstantiation([
                this.responses.size === 0
                  ? t.tsVoidKeyword()
                  : t.tsTypeReference(t.identifier(this.responses.name)),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}
