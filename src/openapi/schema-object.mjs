import { registerSchema } from '../validation/ajv.mjs';
import BaseObject from './abstract/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/schema-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  // we should probably use a meta-schema, but it may be too aggressive
});

export default class SchemaObject extends BaseObject {
  constructor(definition, subpath, owner) {
    super(definition, subpath, owner);

    this.name = subpath[subpath.length - 1];
    this.scope.store(this);
    this.name = this.scope.load(this);
    this.value = definition;
  }

  static schema = SCHEMA;

  get isEmpty() {
    return Object.keys(this.value).length === 0;
  }
}
