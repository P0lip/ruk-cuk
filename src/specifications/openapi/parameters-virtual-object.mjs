import * as t from '@babel/types';

import combineNodes from '../../codegen/utils/combine-nodes.mjs';
import { capitalize } from '../../utils/strings.mjs';
import BaseObject from '../shared/base-object.mjs';
import JsonReferenceObject from '../shared/json-reference-object.mjs';
import ParameterObject from './parameter-object.mjs';
import RequestBodyObject from './request-body-object.mjs';

export default class ParametersVirtualObject extends BaseObject {
  #parameters;
  #requestBody;

  constructor(definition, owner) {
    super(definition, owner);

    this.name = this.scope.generateUnique(`${capitalize(owner.name)}Params`);
    this.scope.store(this);
    this.#parameters = [
      ...owner.owner.parameters,
      ...(definition.parameters?.map(ParameterObject.create, this) ?? []),
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

  get size() {
    return this.#filteredObjects.length;
  }

  generateAccessPath(object) {
    return t.tsTypeReference(
      t.identifier('Pick'),
      t.tsTypeParameterInstantiation([
        t.tsTypeReference(t.identifier(object.owner.name)),
        t.tsLiteralType(t.stringLiteral(object.definitionName)),
      ]),
    );
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
