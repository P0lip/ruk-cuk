import * as t from '@babel/types';

import { basename, toSnakePascalCase } from '../utils/strings.mjs';
import Scope from './scope.mjs';
import Tree from './tree.mjs';
import { sortNodes } from './utils/nodes.mjs';
import safeIdentifier from './utils/safe-identifier.mjs';

export default class BundledTree extends Tree {
  #root;
  #externals = new Map();
  #externalScope = new Scope();

  constructor(config) {
    super(config);
    this.#root = BundledTree.generateModuleDeclaration('Externals', [], false);
  }

  attachExternalDocument(uri, program) {
    if (program.body.length === 1) {
      // single export, can hoist it
      for (const node of program.body) {
        this.assignName(node, uri);
      }
      this.#root.body.body.push(...program.body);
      this.#externals.set(uri, this.#root.id);
    } else if (program.body.length > 1) {
      // multiple exports, need to wrap them in a namespace
      const moduleDeclaration = BundledTree.generateModuleDeclaration(
        BundledTree.generateName(uri),
        program.body,
        false,
      );
      this.assignName(moduleDeclaration.id, uri);
      this.#root.body.body.push(moduleDeclaration);
      this.#externals.set(
        uri,
        t.tsQualifiedName(this.#root.id, moduleDeclaration.id),
      );
    }
  }

  static generateModuleDeclaration(name, body, declare) {
    const moduleDeclaration = t.tsModuleDeclaration(
      t.identifier(name),
      t.tsModuleBlock(body),
    );
    moduleDeclaration.declare = declare;
    return moduleDeclaration;
  }

  static generateName(uri) {
    return safeIdentifier(toSnakePascalCase(basename(uri)));
  }

  assignName(node, uri) {
    switch (node.type) {
      case 'Identifier':
        node.name = this.#externalScope.generateUnique(node.name);
        break;
      case 'TSTypeAliasDeclaration':
        this.assignName(node.id, uri);
        break;
      default:
        throw new TypeError(`Cannot assign name to ${node.type}`);
    }
  }

  getExternal(uri) {
    return this.#externals.get(uri);
  }

  generateAccessPath(object) {
    const name = t.identifier(object.name);
    const external = this.#externals.get(object.resolver.uri);
    if (external === void 0) {
      return t.tsTypeReference(name);
    }

    return t.tsTypeReference(t.tsQualifiedName(external, name));
  }

  toString() {
    const index =
      this.#root.body.body.length === 0 ? null : this.nodes.indexOf(this.#root);

    if (index === -1) {
      this.#root.body.body.sort(sortNodes);
      this.nodes.push(this.#root);
    }

    return super.toString();
  }
}
