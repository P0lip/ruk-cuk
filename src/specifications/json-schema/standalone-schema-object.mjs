import Resolver from '../../codegen/resolver.mjs';
import Scope from '../../codegen/scope.mjs';
import { registerSchema } from '../../validation/ajv.mjs';
import SchemaObject from '../openapi/schema-object.mjs';

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/standalone-json-schema',
  $ref: './json-schema',
});

export default class StandaloneJSONSchemaObject {
  #object;

  constructor(definition, tree, name = definition.title) {
    this.definition = definition;
    this.owner = this;
    this.tree = tree;
    this.scope = Scope.register(this);
    this.resolver = new Resolver(definition);
    this.cache = new Map();
    this.#object = new SchemaObject(definition, this, name);
  }

  static schema = SCHEMA;

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
