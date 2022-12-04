import { capitalize } from '../../utils/strings.mjs';
import BaseObject from '../shared/base-object.mjs';
import ParameterObject from './parameter-object.mjs';
import ReferenceObject from './reference-object.mjs';
import RequestBodyObject from './request-body-object.mjs';
import { isSharedComponentRef } from './utils/refs.mjs';

export default class ParametersVirtualObject extends BaseObject {
  #parameters;
  #requestBody;

  constructor(definition, owner) {
    super(definition, owner);

    this.name = `${capitalize(owner.name)}Params`;
    this.#parameters = [
      ...owner.owner.parameters,
      ...(definition.parameters?.map(this.#processParameter, this) ?? []),
    ];

    this.#requestBody = this.#extractRequestBody(definition);
  }

  get size() {
    return Array.from(this).length;
  }

  *[Symbol.iterator]() {
    yield* this.#parameters.filter(
      ParametersVirtualObject.#isRelevantParameter,
    );
    yield* this.#requestBody;
  }

  #extractRequestBody(definition) {
    return 'requestBody' in definition
      ? new RequestBodyObject(definition.requestBody, this).objects
      : [];
  }

  #processParameter(parameterObjectOrReferenceObject) {
    if (!('$ref' in parameterObjectOrReferenceObject)) {
      return new ParameterObject(parameterObjectOrReferenceObject, this);
    } else if (!isSharedComponentRef(parameterObjectOrReferenceObject.$ref)) {
      return new ParameterObject(
        this.resolver.resolveDocumentFragment(
          parameterObjectOrReferenceObject.$ref,
        ),
        this,
      );
    } else {
      return new ReferenceObject(parameterObjectOrReferenceObject, this);
    }
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
