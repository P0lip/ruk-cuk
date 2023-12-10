import BinaryObject from '../../shared/binary-object.mjs';
import { assignForeignObject } from '../../shared/foreign-object.mjs';
import ArrayObject from '../array-object.mjs';
import BooleanObject from '../boolean-object.mjs';
import BooleanSchemaObject from '../boolean-schema-object.mjs';
import EnumObject from '../enum-object.mjs';
import IntersectionObject from '../intersection-object.mjs';
import NullObject from '../null-object.mjs';
import NumericObject from '../numeric-object.mjs';
import ObjectObject from '../object-object.mjs';
import JsonReferenceObject from '../shared/json-reference-object.mjs';
import StringObject from '../string-object.mjs';
import TupleObject from '../tuple-object.mjs';
import UnionObject from '../union-object.mjs';
import UnknownObject from '../unknown-object.mjs';
import VirtualIntersectionObject from '../virtual-intersection-object.mjs';
import normalizeSchema from './normalizers/index.mjs';

function assignObject(schema, owner) {
  if (typeof schema === 'boolean') {
    return new BooleanSchemaObject(schema, owner);
  }

  if ('$ref' in schema) {
    if (owner.resolver.isForeign(schema.$ref)) {
      return new JsonReferenceObject(
        schema,
        assignForeignObject(schema, owner),
      );
    }

    return new JsonReferenceObject(schema, owner);
  }

  schema = Object.assign({}, schema);
  normalizeSchema(schema);

  const objects = [];

  if ('type' in schema) {
    objects.push(assignTypeObject(schema, owner));
  }

  if ('allOf' in schema) {
    objects.push(new IntersectionObject(schema, owner));
  }

  if ('anyOf' in schema) {
    objects.push(new UnionObject(schema, 'anyOf', owner));
  }

  if ('oneOf' in schema) {
    objects.push(new UnionObject(schema, 'oneOf', owner));
  }

  if ('enum' in schema) {
    objects.push(new EnumObject(schema, owner));
  }

  if (objects.length === 0) {
    return new UnknownObject(schema, owner);
  } else if (objects.length === 1) {
    return objects[0];
  } else {
    return new VirtualIntersectionObject(schema, owner, objects);
  }
}

export default function (schema, owner) {
  let object = owner.cache.get(schema);
  if (object === void 0) {
    object = assignObject(schema, owner);
    owner.cache.set(schema, object);
  }

  return object;
}

function assignTypeObject(schema, owner) {
  if (schema.format === 'binary' || schema.contentEncoding === 'binary') {
    return new BinaryObject(schema, owner);
  }

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
    default:
      throw TypeError(`Invalid type ${schema.type}`);
  }
}
