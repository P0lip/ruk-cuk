import * as t from '@babel/types';

import { REQUEST_BODY_HELPER } from '../../codegen/utils/ruk-cuk-helpers.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import ContentVirtualObject from './content-virtual-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/request-body-object',
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

  build() {
    const program = super.build();
    const type = program.body[0];
    if (type.typeAnnotation.type === 'TSTypeReference') {
      return program;
    }

    this.owner.tree.needsImportHelpers = true;

    type.typeAnnotation = t.tsTypeReference(
      REQUEST_BODY_HELPER,
      t.tsTypeParameterInstantiation([type.typeAnnotation]),
    );

    return program;
  }
}
