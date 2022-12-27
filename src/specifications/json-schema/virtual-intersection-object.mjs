import * as t from '@babel/types';

import BaseObject from './shared/base-object.mjs';

export default class VirtualIntersectionObject extends BaseObject {
  #objects;

  constructor(definition, owner, objects) {
    super(definition, owner);
    this.#objects = objects;
  }

  build() {
    return t.tsIntersectionType(this.#objects.map(BaseObject.build));
  }
}
