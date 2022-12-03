import { registerSchema } from '../validation/ajv.mjs';
import BaseObject from './abstract/base-object.mjs';
import { MediaTypeObject } from './media-type-object.mjs';
import ReferenceObject from './reference-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/content-virtual-object',
  oneOf: [
    {
      additionalProperties: false,
      properties: {
        '*/*': {
          $ref: './media-object#',
        },
      },
      required: ['*/*'],
      type: 'object',
    },
    {
      patternProperties: {
        '^application\\/[a-z0-9-]+$': {
          $ref: './media-object#',
        },
      },
      properties: {
        '*/*': false,
      },
      type: 'object',
    },
  ],
});

export default class ContentVirtualObject extends BaseObject {
  constructor(definition, owner, name) {
    super(definition, owner);

    this.name = name;
    this.objects = MediaTypeObject.createMediaTypeObjects(definition, this);
  }

  static schema = SCHEMA;

  get hasNoSchema() {
    return (
      this.objects.length === 0 ||
      this.objects.every(
        object => !(object instanceof ReferenceObject) && object.schema.isEmpty,
      )
    );
  }
}
