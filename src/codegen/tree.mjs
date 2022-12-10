import * as t from '@babel/types';

import printTree from './utils/print-tree.mjs';

const EVENTS_TYPE = t.tsTypeAliasDeclaration(
  t.identifier('Events'),
  null,
  t.tsNeverKeyword(),
);

export default class Tree {
  #root;
  #operations = {};
  #moduleBlock;
  #actions = [];
  #header;
  #footer;

  constructor(document, config) {
    this.#header = config.header ?? '';
    this.#footer = config.footer ?? '';

    this.#moduleBlock = [
      Tree.#generateActionAliasDeclaration(this.#actions),
      ...(config.skipEvents ? [] : [EVENTS_TYPE]),
    ].filter(Boolean);

    this.#root = Tree.#generateModuleDeclaration(
      `${config.namespacePrefix}${document.name}`,
      this.#moduleBlock,
    );
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

  addObject(object) {
    const node = object.build();
    if (node.type === 'Program') {
      this.#moduleBlock.push(...node.body);
    } else {
      this.#moduleBlock.push(node);
    }
  }

  toString() {
    this.#actions.length = 0;
    this.#actions.push(
      ...Object.entries(this.#operations).map(
        Tree.#generateOperationPropertySignature,
      ),
    );

    return [this.#header, printTree(this.#root), this.#footer].join('\n');
  }
}
