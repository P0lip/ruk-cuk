import BundledTree from '../../codegen/bundled-tree.mjs';
import Scope from '../../codegen/scope.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import SchemaObject from '../openapi/schema-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/standalone-json-schema',
  $ref: './json-schema',
});

export default class StandaloneJSONSchemaObject {
  #object;

  constructor(
    sourceDocument,
    resolver,
    tree,
    name = sourceDocument.definition.title,
  ) {
    this.definition = sourceDocument.definition;
    this.owner = this;
    this.tree = tree;
    this.resolver = resolver;
    this.scope = Scope.register(this);
    this.cache = new Map();
    this.#object = new SchemaObject(
      sourceDocument.definition,
      this,
      name ?? BundledTree.generateName(sourceDocument.source),
    );
  }

  static schema = SCHEMA;

  get name() {
    return this.#object.name;
  }

  dispose() {
    this.cache.clear();
    Scope.unregister(this);
  }

  build() {
    return this.#object.build();
  }

  toString() {
    this.tree.addObject(this);
    return String(this.tree);
  }
}
