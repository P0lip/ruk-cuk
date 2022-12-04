import * as t from '@babel/types';

import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from './shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema/reference-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    $ref: {
      type: 'string',
    },
  },
  required: ['$ref'],
  type: 'object',
});

export default class ReferenceObject extends BaseObject {
  #$ref;

  constructor(definition, owner) {
    super(definition, owner);

    this.#$ref = definition.$ref;
  }

  static schema = SCHEMA;

  get resolved() {
    return this.root.resolver.resolveObject(this.#$ref);
  }

  build() {
    const { name, propertyPath } = this.resolved;

    const object = t.tsTypeReference(t.identifier(name));

    if (propertyPath.length === 0) {
      return object;
    }

    // todo: NonNullable
    return propertyPath.reduce((objectType, key) => {
      return t.tsIndexedAccessType(
        objectType,
        t.tsLiteralType(t.stringLiteral(key)),
      );
    }, object);
  }
}
