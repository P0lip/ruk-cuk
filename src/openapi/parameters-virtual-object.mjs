import { isPlainObject } from '@stoplight/json';

import { capitalize } from '../utils/strings.mjs';
import BaseObject from './base-object.mjs';
import ParameterObject from './parameter-object.mjs';
import ReferenceObject from './reference-object.mjs';
import SchemaObject from './schema-object.mjs';

export default class ParametersVirtualObject extends BaseObject {
  #value;

  constructor(definition, owner) {
    super(definition, ['parameters'], owner);

    this.name = `${capitalize(owner.name)}Params`;
    this.#value = [
      ...owner.owner.parameters,
      ...(definition.parameters?.map(this.#processParameter, this) ?? []),
      this.#extractRequestBody(definition),
    ].filter(Boolean);
  }

  get size() {
    return this.#value.length;
  }

  *[Symbol.iterator]() {
    yield* this.#value;
  }

  #extractRequestBody(definition) {
    const schema =
      definition?.requestBody?.content?.['application/json']?.schema;

    if (isPlainObject(schema)) {
      return new SchemaObject(
        schema,
        ['requestBody', 'content', 'application/json', 'schema'],
        this,
      );
    }

    return null;
  }

  #processParameter(parameterObjectOrReferenceObject, i) {
    const subpath = ['parameters', String(i)];
    if ('$ref' in parameterObjectOrReferenceObject) {
      return new ReferenceObject(
        parameterObjectOrReferenceObject,
        subpath,
        this,
      );
    }

    return new ParameterObject(parameterObjectOrReferenceObject, subpath, this);
  }
}
