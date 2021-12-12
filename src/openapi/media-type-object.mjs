import { isPlainObject } from '@stoplight/json';

import BaseObject from './abstract/base-object.mjs';
import ReferenceObject from './reference-object.mjs';
import SchemaObject from './schema-object.mjs';
import { registerSchema } from './validation/ajv.mjs';

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
  constructor(definition, subpath, owner) {
    super(definition, subpath, owner);

    this.schema = new SchemaObject(
      definition.schema ?? {},
      [...subpath, 'schema'],
      this,
    );
  }

  static schema = SCHEMA;

  static createMediaTypeObjects(definition, subpath, owner) {
    if ('$ref' in definition) {
      return [new ReferenceObject(definition, [...subpath, '$ref'], owner)];
    }

    const mediaTypeObjects = [];

    if (isPlainObject(definition.content)) {
      for (const key of Object.keys(definition.content)) {
        mediaTypeObjects.push(
          new MediaTypeObject(
            definition.content[key],
            [...subpath, 'content', key],
            owner,
          ),
        );
      }
    }

    return mediaTypeObjects;
  }
}
