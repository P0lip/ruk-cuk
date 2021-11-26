import BaseObject from './base-object.mjs';

export default class SchemaObject extends BaseObject {
  constructor(definition, subpath, owner) {
    super(definition, subpath, owner);

    this.name = subpath[subpath.length - 1];
    this.scope.store(this);
    this.name = this.scope.load(this);
    this.value = definition;
  }
}
