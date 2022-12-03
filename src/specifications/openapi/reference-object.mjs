import { registerSchema } from '../../validation/ajv.mjs';
import BaseObject from '../shared/base-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/reference-object',
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    $ref: {
      type: 'string',
    },
  },
  required: ['$ref'],
  type: 'object',
});

export default class ReferenceObject extends BaseObject {
  #_resolved;
  #reference;

  constructor(definition, owner) {
    super(definition, owner);

    this.#reference = definition.$ref;
  }

  static schema = SCHEMA;

  get #resolved() {
    return (this.#_resolved ??= this.resolver.resolveObject(this.#reference));
  }

  get referencedObject() {
    return this.#resolved.referencedObject;
  }

  get name() {
    return this.#resolved.name;
  }
}
