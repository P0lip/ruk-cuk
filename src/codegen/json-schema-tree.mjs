import * as t from '@babel/types';

import BundledTree from './bundled-tree.mjs';

export default class JSONSchemaTree extends BundledTree {
  constructor(document, config) {
    super(document, config);

    this.root = t.program(this.nodes);
  }
}
