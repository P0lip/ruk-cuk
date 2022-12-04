import * as t from '@babel/types';

import isSafeIdentifier from '../../codegen/utils/is-safe-identifier.mjs';
import { prepareForBlockComment } from '../../utils/strings.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from './shared/base-object.mjs';
import assignObject from './utils/assign-object.mjs';

// export type PrefixedRecord<
// T extends Record<string, unknown>,
//   P extends string,
// > = {
//   [K in keyof T as K extends string ? `${P}${K}` : never]: T[K];
// };

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/json-schema/object-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    additionalProperties: {
      oneOf: [
        {
          type: 'boolean',
        },
        {
          type: 'object',
        },
      ],
    },
    patternProperties: {},
    properties: {
      oneOf: [
        {
          type: 'object',
        },
        {
          type: 'boolean',
        },
      ],
    },
    propertyNames: {},
    required: {
      items: {
        type: 'string',
      },
      type: 'array',
    },
  },
  type: 'object',
});

export default class ObjectObject extends BaseObject {
  #additionalProperties;
  #properties;

  constructor(definition, owner) {
    super(definition, owner);

    if (!('additionalProperties' in definition)) {
      this.#additionalProperties = true;
    } else {
      this.#additionalProperties =
        typeof definition.additionalProperties === 'boolean'
          ? definition.additionalProperties
          : assignObject(definition.additionalProperties, this);
    }

    if ('properties' in definition) {
      this.#properties = Object.keys(definition.properties).map(key => [
        key,
        assignObject(definition.properties[key], this),
        definition.required?.includes(key) === true,
      ]);
    } else {
      this.#properties = [];
    }
  }

  static schema = SCHEMA;

  build() {
    const members = this.#properties.map(([key, value, required]) => {
      const prop = t.tsPropertySignature(
        isSafeIdentifier(key) ? t.identifier(key) : t.stringLiteral(key),
        t.tsTypeAnnotation(value.build()),
      );
      prop.optional = !required;

      if (
        'description' in value &&
        value.description !== null &&
        value.description.length > 0
      ) {
        t.addComment(
          prop,
          'leading',
          prepareForBlockComment(value.description.trim()),
        );
      }

      return prop;
    });

    if (members.length === 0) {
      return t.tsTypeReference(
        t.identifier('Record'),
        t.tsTypeParameterInstantiation([
          t.tsStringKeyword(),
          this.#additionalProperties === true
            ? t.tsUnknownKeyword()
            : this.#additionalProperties === false
            ? t.tsNeverKeyword()
            : this.#additionalProperties.build(),
        ]),
      );
    }

    if (this.#additionalProperties === true) {
      const key = t.identifier('k');
      key.typeAnnotation = t.tsTypeAnnotation(t.tsStringKeyword());
      const additional = t.tsIndexSignature(
        [key],
        t.tsTypeAnnotation(t.tsUnknownKeyword()),
      );
      members.push(additional);
    }

    return t.tsTypeLiteral(members);
  }
}
