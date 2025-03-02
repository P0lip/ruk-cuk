import * as t from '@babel/types';

import { ARRAY_RANGE_HELPER } from '../../codegen/utils/ruk-cuk-helpers.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import assignObject from './schema-utils/assign-object.mjs';
import BaseObject from './shared/base-object.mjs';
import UnknownObject from './unknown-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema/array-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    items: {
      $ref: '../json-schema',
    },
    maxItems: {
      type: 'number',
    },
    minItems: {
      type: 'number',
    },
    type: {
      const: 'array',
    },
  },
  required: ['type'],
  type: 'object',
});

export default class ArrayObject extends BaseObject {
  #object;
  #minItems;
  #maxItems;

  constructor(definition, owner) {
    super(definition, owner);

    this.#object =
      definition.items !== void 0
        ? assignObject(definition.items, this)
        : new UnknownObject(definition, this);
    this.#minItems = definition.minItems;
    this.#maxItems = definition.maxItems;
  }

  static schema = SCHEMA;

  static keywords = Object.keys(SCHEMA.properties);

  #buildRange(minItems, maxItems) {
    if (minItems > maxItems) {
      return t.tsNeverKeyword();
    }

    if (minItems === maxItems) {
      const hoistedObject = BaseObject.buildHoistedObject(this.#object);
      return t.tsTupleType([...new Array(minItems).fill(hoistedObject)]);
    }

    this.owner.tree.needsImportHelpers = true;

    return t.tsTypeReference(
      ARRAY_RANGE_HELPER,
      t.tsTypeParameterInstantiation([
        BaseObject.build(this.#object),
        t.tsLiteralType(t.numericLiteral(minItems)),
        t.tsLiteralType(t.numericLiteral(maxItems)),
      ]),
    );
  }

  build() {
    if (this.#minItems !== void 0 && this.#maxItems !== void 0) {
      return this.#buildRange(this.#minItems, this.#maxItems);
    }

    if (this.#minItems > 0) {
      const hoistedObject = BaseObject.buildHoistedObject(this.#object);
      return t.tsTupleType([
        ...new Array(this.#minItems).fill(hoistedObject),
        t.tsRestType(t.tsArrayType(hoistedObject)),
      ]);
    } else if (this.#maxItems === 0) {
      return t.tsTupleType([]);
    } else if (this.#maxItems >= 1) {
      return this.#buildRange(0, this.#maxItems);
    }

    return t.tsArrayType(this.#object.build());
  }
}
