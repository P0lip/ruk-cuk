import { isPlainObject } from '@stoplight/json';

import BaseObject from './base-object.mjs';
import SchemaObject from './schema-object.mjs';

export default class ResponseObject extends BaseObject {
  #schema;

  constructor(definition, subpath, owner) {
    super(definition, subpath, owner);

    const schema = (this.#schema =
      definition?.content?.['application/json']?.schema);

    this.schema = new SchemaObject(
      schema ?? {},
      ['content', 'application/json', 'schema'],
      this,
    );
  }

  get hasNoSchema() {
    return !isPlainObject(this.#schema);
  }
}
