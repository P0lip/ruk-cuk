import { isPlainObject } from '@stoplight/json';

import { toPascalCase } from '../utils/string.mjs';
import BaseObject from './base-object.mjs';
import SchemaObject from './schema-object.mjs';

export default class ParameterObject extends BaseObject {
  constructor(definition, subpath, owner) {
    super(definition, subpath, owner);

    this.name = toPascalCase(definition.name);

    const schema = {
      additionalProperties: false,
      id: definition.name,
      properties: {
        [definition.name]: isPlainObject(definition.schema)
          ? definition.schema
          : {}, // could be true, but IIRC it's not supported by json-schema-to-typescript
      },
      required: definition.required === true ? [definition.name] : [],
      type: 'object',
    };

    this.schema = new SchemaObject(schema, ['schema'], this);
    this.schema.name = this.name;
  }
}
