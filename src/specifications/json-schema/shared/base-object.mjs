import BaseObject from '../../shared/base-object.mjs';

export default class BaseSchemaObject extends BaseObject {
  constructor(definition, owner) {
    super(definition, owner);

    this.description = definition.description ?? null;
    this.context = owner.context;
  }
}
