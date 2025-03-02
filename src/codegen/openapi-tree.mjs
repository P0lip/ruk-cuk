import * as t from '@babel/types';

import Tree from './tree.mjs';

const EVENTS_TYPE = t.tsTypeAliasDeclaration(
  t.identifier('Events'),
  null,
  t.tsNeverKeyword(),
);

export default class OpenAPITree extends Tree {
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

    this.root = OpenAPITree.#generateModuleDeclaration(
      `${config.namespacePrefix}`,
      this.nodes,
    );
    this.program.body = [this.root];
  }

  get name() {
    return this.root.id.name;
  }

  set name(value) {
    this.root.id.name = `${this.config.namespacePrefix}${value}`;
  }

  static #generateActionAliasDeclaration(actions) {
    return t.tsTypeAliasDeclaration(
      t.identifier('Actions'),
      null,
      t.tsTypeLiteral(actions),
    );
  }

  static #generateModuleDeclaration(name, body) {
    const moduleDeclaration = t.tsModuleDeclaration(
      t.identifier(name),
      t.tsModuleBlock(body),
    );
    moduleDeclaration.declare = true;
    return moduleDeclaration;
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
