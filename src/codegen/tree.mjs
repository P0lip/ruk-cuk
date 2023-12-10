import * as t from '@babel/types';

import printTree from './utils/print-tree.mjs';

class TreeFragment {
  #hoisted = new WeakMap();
  nodes = [];

  constructor(bundled = this) {
    this.bundled = bundled;
  }

  createFragment() {
    return new TreeFragment(this.bundled);
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
}

export default class Tree extends TreeFragment {
  #header;
  #footer;

  constructor(config = {}) {
    super();
    this.bundled = this;
    this.config = config;
    this.#header = config.header ?? '';
    this.#footer = config.footer ?? '';
  }

  toString() {
    return [this.#header, printTree(this.root), this.#footer].join('\n').trim();
  }
}
