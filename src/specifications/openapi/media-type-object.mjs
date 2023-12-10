import { isPlainObject } from '@stoplight/json';

import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';
import { assignForeignObject } from '../shared/foreign-object.mjs';
import JsonReferenceObject from '../shared/json-reference-object.mjs';
import SchemaObject from './schema-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/media-object',
  properties: {
    schema: {
      $ref: './schema-object#',
    },
  },
  type: 'object',
});

export default class MediaTypeObject extends BaseObject {
  constructor(definition, owner) {
    super(definition, owner);

    this.schema = new SchemaObject(definition.schema ?? {}, this, 'schema');
  }

  static schema = SCHEMA;

  build() {
    return BaseObject.build(this.schema);
  }

  static createMediaTypeObjects(definition, owner) {
    if ('$ref' in definition) {
      return [
        new JsonReferenceObject(
          definition,
          owner.resolver.isForeign(definition.$ref)
            ? assignForeignObject(definition, owner)
            : owner,
        ),
      ];
    }

    const mediaTypeObjects = [];

    if (isPlainObject(definition.content)) {
      for (const key of Object.keys(definition.content)) {
        mediaTypeObjects.push(
          new MediaTypeObject(definition.content[key], owner),
        );
      }
    }

    return mediaTypeObjects;
  }
}
