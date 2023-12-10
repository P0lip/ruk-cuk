import combineNodes from '../../codegen/utils/combine-nodes.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import BaseAnnotatedObject from '../shared/base-annotated-object.mjs';
import BaseObject from '../shared/base-object.mjs';
import JsonReferenceObject from '../shared/json-reference-object.mjs';
import MediaTypeObject from './media-type-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/content-virtual-object',
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

const TS_TAGS_MAP = [
  {
    keyword: 'description',
    kind: 'string',
    tag: '',
  },
];

export default class ContentVirtualObject extends BaseAnnotatedObject {
  #objects;

  constructor(definition, owner, name) {
    super(definition, owner, TS_TAGS_MAP);

    this.name = name;
    this.#objects = MediaTypeObject.createMediaTypeObjects(definition, this);
  }

  static schema = SCHEMA;

  build() {
    return this.attachTsDocBlock(
      combineNodes(
        this.#objects.flatMap(BaseObject.build),
        'tsUnionType',
        this.name,
      ),
    );
  }

  get hasNoSchema() {
    return (
      this.#objects.length === 0 ||
      this.#objects.every(
        object =>
          !(object instanceof JsonReferenceObject) && object.schema.isEmpty,
      )
    );
  }
}
