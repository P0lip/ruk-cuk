import * as assert from 'node:assert';

import { dropCompoundKeywords } from '../keywords.mjs';

function assertValidEnumUsage(schema) {
  // we omit oneOf/anyOf/allOf and other compound keywords, tho we could use Ajv to validate the schema against each enum member
  if (!('type' in schema)) return;

  for (const item of schema.enum) {
    const foundType = getType(item);
    if (foundType === 'integer' && schema.type.includes('number')) continue;

    assert.ok(schema.type.includes(foundType));
  }
}

function getObjectType(value) {
  if (value === null) {
    return 'null';
  } else if (Array.isArray(value)) {
    return 'array';
  } else {
    return 'object';
  }
}

function getType(value) {
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return Number.isInteger(value) ? 'integer' : 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return getObjectType(value);
    default:
      throw TypeError(`Invalid type ${typeof value}`);
  }
}

export default function normalizeEnum(schema) {
  if ('enum' in schema) {
    assertValidEnumUsage(schema);
    delete schema.type;
    dropCompoundKeywords(schema);
  }
}
