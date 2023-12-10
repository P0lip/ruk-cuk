import * as t from '@babel/types';

import BundledTree from './bundled-tree.mjs';

const EVENTS_TYPE = t.tsTypeAliasDeclaration(
  t.identifier('Events'),
  null,
  t.tsNeverKeyword(),
);

export default class OpenAPITree extends BundledTree {
  #operations = {};
  #actions = [];

  constructor(config) {
    super(config);

    this.nodes.push(
      ...[
        OpenAPITree.#generateActionAliasDeclaration(this.#actions),
        ...(config.skipEvents ? [] : [EVENTS_TYPE]),
      ].filter(Boolean),
    );

    this.root = BundledTree.generateModuleDeclaration(
      `${config.namespacePrefix}`,
      this.nodes,
      true,
    );
  }

  get name() {
    return this.root.id.name;
  }

  set name(value) {
    this.root.id.name = `${this.config.namespacePrefix ?? ''}${value}`;
  }

  generateAccessPath(object) {
    const external = this.getExternal(object.resolver.uri);
    if (external === void 0 && 'generateAccessPath' in object.owner) {
      return object.owner.generateAccessPath(object);
    }

    return super.generateAccessPath(object);
  }

  static #generateActionAliasDeclaration(actions) {
    return t.tsTypeAliasDeclaration(
      t.identifier('Actions'),
      null,
      t.tsTypeLiteral(actions),
    );
  }

  static #generateOperationPropertySignature([namespace, operations]) {
    return t.tsPropertySignature(
      t.stringLiteral(namespace),
      t.tsTypeAnnotation(t.tsTypeLiteral(operations)),
    );
  }

  addOperationObject(operationObject) {
    (this.#operations[operationObject.namespace] ??= []).push(
      operationObject.build(),
    );

    this.addObject(operationObject.parameters);
    this.addObject(operationObject.responses);
  }

  toString() {
    this.#actions.length = 0;
    this.#actions.push(
      ...Object.entries(this.#operations).map(
        OpenAPITree.#generateOperationPropertySignature,
      ),
    );

    return super.toString();
  }
}
