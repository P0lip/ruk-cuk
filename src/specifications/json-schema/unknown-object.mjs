import * as t from '@babel/types';

import BaseObject from './shared/base-object.mjs';

export default class UnknownObject extends BaseObject {
  constructor(definition, owner) {
    super(definition, owner);
  }

  build() {
    return t.tsUnknownKeyword();
  }
}
