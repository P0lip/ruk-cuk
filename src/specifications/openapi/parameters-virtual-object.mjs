import combineNodes from '../../codegen/utils/combine-nodes.mjs';
import { capitalize } from '../../utils/strings.mjs';
import BaseObject from '../shared/base-object.mjs';
import JsonReferenceObject from '../shared/json-reference-object.mjs';
import ParameterObject from './parameter-object.mjs';
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

  get #filteredObjects() {
    const objects = this.#parameters.filter(
      ParametersVirtualObject.#isRelevantParameter,
    );

    if (this.#requestBody !== null) {
      objects.push(this.#requestBody);
    }

    return objects;
  }

  *[Symbol.iterator]() {
    yield* this.#filteredObjects;
  }

  get size() {
    return this.#filteredObjects.length;
  }

  build() {
    return combineNodes(
      this.#filteredObjects.map(BaseObject.build),
      'tsIntersectionType',
      this.name,
    );
  }

  #extractRequestBody(definition) {
    return 'requestBody' in definition
      ? new RequestBodyObject(definition.requestBody, this, this.name)
      : null;
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
      return new JsonReferenceObject(parameterObjectOrReferenceObject, this);
    }
  }

  static #isRelevantParameter(object) {
    switch (true) {
      case object instanceof RequestBodyObject:
        return true;
      case object instanceof JsonReferenceObject:
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
