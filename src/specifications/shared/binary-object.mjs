import * as t from '@babel/types';

import BaseObject from './base-object.mjs';

let node;

export default class BinaryObject extends BaseObject {
  build() {
    node ??= t.tsTypeReference(
      t.tsQualifiedName(t.identifier('NodeJS'), t.identifier('ReadableStream')),
    );
    return node;
  }
}
