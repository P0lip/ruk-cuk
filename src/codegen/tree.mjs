import * as t from '@babel/types';

import printTree from './utils/print-tree.mjs';
import { HELPERS_IMPORT } from './utils/ruk-cuk-helpers.mjs';

export default class Tree {
  nodes = [];
  program;
  needsImportHelpers = false;

  #hoisted = new WeakMap();
  #header;
  #footer;

  constructor(config = {}) {
    this.config = config;
    this.#header = config.header ?? '';
    this.#footer = config.footer ?? '';
    this.program = t.program(this.nodes, [], 'module');
    this.root = this.program;
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
    if (this.needsImportHelpers) {
      this.program.body.unshift(HELPERS_IMPORT);
    }

    return [this.#header, printTree(this.program), this.#footer]
      .join('\n')
      .trim();
  }
}
