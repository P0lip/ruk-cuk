import * as assert from 'node:assert';

import BaseObject from './base-object.mjs';
import ParametersVirtualObject from './parameters-virtual-object.mjs';
import ResponsesVirtualObject from './responses-virtual-object.mjs';

const ID_REGEXP =
  /^(?<namespace>v[0-9]\.[a-zA-Z]+)\.(?<action>[a-z][A-Za-z]*)$/;

export default class OperationObject extends BaseObject {
  constructor(definition, verb, owner) {
    super(definition, [verb], owner);

    const { action, namespace } = OperationObject.#parseOperationId(
      definition.operationId,
    );
    this.namespace = namespace;
    this.name = action;
    this.parameters = new ParametersVirtualObject(definition, this);
    this.responses = new ResponsesVirtualObject(definition, this);
  }

  static #parseOperationId(id) {
    const parsed = ID_REGEXP.exec(id);
    assert.ok(parsed !== null, 'Invalid operationId specified!');
    return parsed.groups;
  }
}
