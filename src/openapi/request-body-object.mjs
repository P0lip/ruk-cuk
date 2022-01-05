import { registerSchema } from '../validation/ajv.mjs';
import ContentVirtualObject from './content-virtual-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/request-body-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    content: {
      $ref: './content-virtual-object',
    },
  },
  type: 'object',
});

export default class RequestObjectBody extends ContentVirtualObject {
  static schema = SCHEMA;
}
