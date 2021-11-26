import { isPlainObject } from '@stoplight/json';

import { capitalize } from '../utils/string.mjs';
import BaseObject from './base-object.mjs';
import ResponseObject from './response-object.mjs';

export default class ResponsesVirtualObject extends BaseObject {
  #value;

  constructor(definition, owner) {
    super(definition, ['responses'], owner);

    this.name = `${capitalize(owner.name)}Response`;
    this.#value = isPlainObject(definition.responses)
      ? this.#getSuccessResponses(definition.responses).filter(
          ResponsesVirtualObject.#hasBody,
        )
      : [];
  }

  get size() {
    return this.#value.length;
  }

  *[Symbol.iterator]() {
    yield* this.#value;
  }

  static #isSuccessResponse(code) {
    const parsed = Number.parseInt(code);
    return !Number.isNaN(parsed) && parsed >= 200 && parsed < 300;
  }

  static #hasBody(referenceObject) {
    return !referenceObject.hasNoSchema;
  }

  #getSuccessResponses(responses) {
    if ('2XX' in responses) {
      return [new ResponseObject(responses['2XX'], ['2XX'], this)];
    } else {
      return Object.keys(responses)
        .filter(ResponsesVirtualObject.#isSuccessResponse)
        .map(code => new ResponseObject(responses[code], [code], this));
    }

    // todo: handle 3xx, 300-399?
  }
}
