import * as t from '@babel/types';

import Tree from './tree.mjs';

export default class JSONSchemaTree extends Tree {
  constructor(document, config) {
    super(document, config);

    this.root = t.program(this.nodes);
  }
}
