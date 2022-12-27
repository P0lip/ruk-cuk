import { registerSchema } from '../../validation/ajv.mjs';
import JSONSchemaObject from '../json-schema/schema-object.mjs';
import BaseObject from '../shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/openapi/schema-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  // we should probably use a meta-schema, but it may be too aggressive
});

export default class SchemaObject extends BaseObject {
  #object;

  static schema = SCHEMA;

  constructor(definition, owner, name) {
    super(definition, owner);

    this.name = name;
    this.isEmpty = Object.keys(definition).length === 0;
    this.#object = new JSONSchemaObject(definition, this, name);
  }

  build() {
    return BaseObject.build(this.#object);
  }
}
