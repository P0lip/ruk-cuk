import * as t from '@babel/types';

import generateOperationObject from './generators/operation-object.mjs';
import generateParametersVirtualObject from './generators/parameters-virtual-object.mjs';
import generateResponsesVirtualObject from './generators/responses-virtual-object.mjs';
import generateSchemaObject from './generators/schema-object.mjs';
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

  constructor(service) {
    this.#moduleBlock = [
      Tree.#generateActionAliasDeclaration(this.#actions),
      EVENTS_TYPE,
    ];

    this.#root = Tree.#generateModuleDeclaration(service, this.#moduleBlock);
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
      generateOperationObject(operationObject),
    );

    this.#moduleBlock.push(
      ...generateParametersVirtualObject(operationObject.parameters),
      ...generateResponsesVirtualObject(operationObject.responses),
    );
  }

  addComponentsSchemaObject(schemaObject) {
    this.#moduleBlock.push(...generateSchemaObject(schemaObject));
  }

  addComponentsParameterObject(parameterObject) {
    this.#moduleBlock.push(...generateSchemaObject(parameterObject.schema));
  }

  toString() {
    this.#actions.length = 0;
    this.#actions.push(
      ...Object.entries(this.#operations).map(
        Tree.#generateOperationPropertySignature,
      ),
    );

    return printTree(this.#root);
  }
}
