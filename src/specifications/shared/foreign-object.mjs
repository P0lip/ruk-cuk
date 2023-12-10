import { extractSourceFromRef } from '@stoplight/json';

import Scope from '../../codegen/scope.mjs';
import SourceDocument from '../../core/source-document.mjs';
import StandaloneJSONSchemaObject from '../json-schema/standalone-schema-object.mjs';
import OpenAPIObject from '../openapi/openapi-object.mjs';
import BaseObject from './base-object.mjs';

function assignObject(sourceDocument, resolver, tree) {
  return 'openapi' in sourceDocument.definition
    ? new OpenAPIObject(sourceDocument, resolver, tree)
    : new StandaloneJSONSchemaObject(sourceDocument, resolver, tree);
}

export function assignForeignObject(definition, owner) {
  return (
    owner.resolver.retrieveDocument(definition.$ref) ??
    new ForeignObject(definition, owner)
  );
}

export default class ForeignObject extends BaseObject {
  #object;

  constructor(definition, owner) {
    super(definition, owner);

    this.scope = new Scope();
    this.#object = null;
    const fileUri = extractSourceFromRef(definition.$ref);
    this.resolver.registerDocument(
      this.resolver.resolveExternalRef(fileUri),
      this,
    );

    this.resolver.resolveDocumentFragment(fileUri, (definition, resolver) => {
      this.resolver = resolver;
      const treeFragment = owner.tree.createFragment();
      this.#object = assignObject(
        new SourceDocument(definition, resolver.uri),
        resolver,
        treeFragment,
      );

      resolver.store(definition, this.#object);

      return this.resolver.drain().then(() => {
        owner.tree.bundled.attachExternalDocument(
          resolver.uri,
          this.#object.build(),
        );
      });
    });
  }
}
