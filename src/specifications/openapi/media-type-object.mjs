import { isPlainObject, resolveInlineRef } from '@stoplight/json';

import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';
import ReferenceObject from './reference-object.mjs';
import SchemaObject from './schema-object.mjs';
import { isSharedComponentRef } from './utils/refs.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/media-object',
  properties: {
    schema: {
      $ref: './schema-object#',
    },
  },
  type: 'object',
});

export class MediaTypeObject extends BaseObject {
  constructor(definition, owner) {
    super(definition, owner);

    this.schema = new SchemaObject(definition.schema ?? {}, this, 'schema');
  }

  static schema = SCHEMA;

  static createMediaTypeObjects(definition, owner) {
    if ('$ref' in definition) {
      if (isSharedComponentRef(definition.$ref)) {
        return [new ReferenceObject(definition, owner)];
      } else {
        definition = resolveInlineRef(owner.document, definition.$ref);
      }
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
