import { capitalize } from '../utils/strings.mjs';
import BaseObject from './abstract/base-object.mjs';
import ParameterObject from './parameter-object.mjs';
import ReferenceObject from './reference-object.mjs';
import RequestBodyObject from './request-body-object.mjs';

export default class ParametersVirtualObject extends BaseObject {
  #value;

  constructor(definition, owner) {
    super(definition, ['parameters'], owner);

    this.name = `${capitalize(owner.name)}Params`;
    this.#value = [
      ...[
        ...owner.owner.parameters,
        ...(definition.parameters?.map(this.#processParameter, this) ?? []),
      ].filter(ParametersVirtualObject.#isRelevantParameter),
      ...this.#extractRequestBody(definition),
    ];
  }

  get size() {
    return this.#value.length;
  }

  *[Symbol.iterator]() {
    yield* this.#value;
  }

  #extractRequestBody(definition) {
    return 'requestBody' in definition
      ? new RequestBodyObject(definition.requestBody, ['requestBody'], this)
          .objects
      : [];
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

  static #isRelevantParameter(object) {
    switch (true) {
      case object instanceof RequestBodyObject:
        return true;
      case object instanceof ReferenceObject:
        return ParametersVirtualObject.#isRelevantParameter(
          object.referencedObject,
        );
      case object instanceof ParameterObject:
        return object.in === 'path' || object.in === 'query';
      default:
        return false;
    }
  }
}
