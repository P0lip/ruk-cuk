import * as t from '@babel/types';

import printTree from './utils/print-tree.mjs';

export default class Tree {
  nodes = [];

  #hoisted = new WeakMap();
  #header;
  #footer;

  constructor(config = {}) {
    this.config = config;
    this.#header = config.header ?? '';
    this.#footer = config.footer ?? '';
  }

  hoist(name, node) {
    let hoisted = this.#hoisted.get(node);
    if (hoisted === void 0) {
      const identifier = t.identifier(name);
      this.addNode(t.tsTypeAliasDeclaration(identifier, null, node));
      hoisted = t.tsTypeReference(identifier);
      this.#hoisted.set(node, hoisted);
    }

    return hoisted;
  }

  addNode(node) {
    if (node.type === 'Program') {
      this.nodes.push(...node.body);
    } else {
      this.nodes.push(node);
    }
  }

  addObject(object) {
    this.addNode(object.build());
  }

  toString() {
    return [this.#header, printTree(this.root), this.#footer].join('\n').trim();
  }
}
