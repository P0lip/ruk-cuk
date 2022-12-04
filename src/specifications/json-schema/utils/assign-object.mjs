import * as assert from 'node:assert';

import ArrayObject from '../array-object.mjs';
import BooleanObject from '../boolean-object.mjs';
import BooleanSchemaObject from '../boolean-schema-object.mjs';
import IntersectionObject from '../intersection-object.mjs';
import NullObject from '../null-object.mjs';
import NumericObject from '../numeric-object.mjs';
import ObjectObject from '../object-object.mjs';
import ReferenceObject from '../reference-object.mjs';
import StringObject from '../string-object.mjs';
import TupleObject from '../tuple-object.mjs';
import UnionObject from '../union-type.mjs';

export default function assignObject(schema, owner) {
  if (typeof schema === 'boolean') {
    return new BooleanSchemaObject(schema);
  }

  normalizeSchema(schema);

  switch (true) {
    case 'type' in schema:
      return assignTypeObject(schema, owner);
    case 'allOf' in schema:
      return new IntersectionObject(schema, owner);
    case 'oneOf' in schema:
    case 'enum' in schema:
      return new UnionObject(schema, owner);
    case '$ref' in schema:
      return new ReferenceObject(schema, owner);
    default:
      return new BooleanSchemaObject(true);
  }
}

function assignTypeObject(schema, owner) {
  switch (schema.type) {
    case 'number':
    case 'integer':
      return new NumericObject(schema, owner);
    case 'string':
      return new StringObject(schema, owner);
    case 'object':
      return new ObjectObject(schema, owner);
    case 'array':
      if (Array.isArray(schema.items)) {
        return new TupleObject(schema, owner);
      }

      return new ArrayObject(schema, owner);
    case 'boolean':
      return new BooleanObject(schema, owner);
    case 'null':
      return new NullObject(schema, owner);
  }
}

function assertValidConstUsage(schema) {
  // we omit oneOf/anyOf/allOf and other compound keywords
  if ('enum' in schema) {
    assert.ok(
      schema.enum.includes(schema.const),
      'Const used, but not declared in an enum',
    );
  }
}

function assertValidEnumUsage(schema) {
  // we omit oneOf/anyOf/allOf and other compound keywords
  if (!('type' in schema)) return;

  for (const item of schema.enum) {
    const foundType = getType(item);
    if (foundType === 'integer' && schema.type.includes('number')) continue;

    assert.ok(schema.type.includes(foundType));
  }
}

function normalizeType(types) {
  const numberIndex = types.indexOf('number');
  if (types.includes('integer')) {
    types.splice(numberIndex, 1);
  }

  for (let i = types.length - 1; i > 0; i--) {
    if (types.indexOf(types[i]) !== i) {
      types.splice(i, 1);
    }
  }
}

function normalizeSchema(schema) {
  if ('const' in schema) {
    assertValidConstUsage(schema);
    schema.enum = [schema.const];
    delete schema.type;
  }

  if ('enum' in schema) {
    assertValidEnumUsage(schema);
    delete schema.type;
    return;
  }

  if (schema.type !== void 0) {
    if (Array.isArray(schema.type)) {
      normalizeType(schema.type);

      schema.oneOf ??= [];
      schema.oneOf.push(
        ...schema.type.map(type => {
          return {
            ...schema,
            type: type,
          };
        }),
      );
      delete schema.type;
    }
  }

  if ('anyOf' in schema) {
    schema.oneOf ??= [];
    schema.oneOf.push(...schema.anyOf);
    delete schema.anyOf;
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
      return value === null
        ? 'null'
        : Array.isArray(value)
        ? 'array'
        : 'object';
    default:
      throw TypeError(`Invalid type ${typeof value}`);
  }
}
