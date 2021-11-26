import { isPlainObject } from '@stoplight/json';

import Scope from '../codegen/scope.mjs';
import { toCapitalSnakeCase } from '../utils/string.mjs';
import ParameterObject from './parameter-object.mjs';
import PathItemObject from './path-item-object.mjs';
import ResponseObject from './response-object.mjs';
import SchemaObject from './schema-object.mjs';

export default class OpenAPIObject {
  #definition;

  constructor(definition) {
    this.scope = Scope.register(this);

    this.owner = this;
    this.document = definition;
    this.#definition = definition;

    this.name = toCapitalSnakeCase(definition.info.title);

    this.components = this.#getComponentsObjectContents();
    this.pathItems = this.#getPathItemObjects();
  }

  dispose() {
    Scope.unregister(this);
  }

  #getComponentsObjectContents() {
    const { components } = this.#definition;
    if (!isPlainObject(components)) return [];

    const objects = [];

    if ('parameters' in components) {
      for (const [key, definition] of Object.entries(components.parameters)) {
        objects.push(
          new ParameterObject(
            definition,
            ['components', 'parameters', key],
            this,
          ),
        );
      }
    }

    if ('schemas' in components) {
      for (const [key, definition] of Object.entries(components.schemas)) {
        objects.push(
          new SchemaObject(definition, ['components', 'schemas', key], this),
        );
      }
    }

    if ('responses' in components) {
      for (const [key, definition] of Object.entries(components.responses)) {
        objects.push(
          new ResponseObject(
            definition,
            ['components', 'responses', key],
            this,
          ),
        );
      }
    }

    return objects;
  }

  #getPathItemObjects() {
    const pathItems = [];

    for (const [key, definition] of Object.entries(this.#definition.paths)) {
      pathItems.push(new PathItemObject(definition, key, this));
    }

    return pathItems;
  }

  *[Symbol.iterator]() {
    yield* this.pathItems.values();
    yield* this.components.values();
  }
}
