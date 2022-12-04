import * as t from '@babel/types';

import BaseObject from '../shared/base-object.mjs';

function buildJson(input) {
  switch (typeof input) {
    case 'boolean':
      return t.tsLiteralType(t.booleanLiteral(input));
    case 'string':
      return t.tsLiteralType(t.stringLiteral(input));
    case 'number':
      return t.tsLiteralType(t.numericLiteral(input));
    case 'object':
      if (input === null) {
        return t.tsNullKeyword();
      }

      if (Array.isArray(input)) {
        return t.tsTupleType(input.map(buildJson));
      }

      return t.tsTypeLiteral(
        Object.keys(input).map(key =>
          t.tsPropertySignature(t.stringLiteral(key), buildJson(input[key])),
        ),
      );
  }
}

export default class LiteralObject extends BaseObject {
  #value;

  constructor(definition, owner) {
    super(definition, owner);

    this.#value = definition;
  }

  build() {
    return buildJson(this.#value);
  }
}
