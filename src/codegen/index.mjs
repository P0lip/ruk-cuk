import Resolver from '../core/resolver.mjs';
import StandaloneJSONSchemaObject from '../specifications/json-schema/standalone-schema-object.mjs';
import OpenAPIObject from '../specifications/openapi/openapi-object.mjs';
import JSONSchemaTree from './json-schema-tree.mjs';
import OpenAPITree from './openapi-tree.mjs';

export default async function generate(sourceDocument, config, fs) {
  const resolver = new Resolver(sourceDocument, fs);
  const document =
    'openapi' in sourceDocument.definition
      ? new OpenAPIObject(sourceDocument, resolver, new OpenAPITree(config))
      : new StandaloneJSONSchemaObject(
          sourceDocument,
          resolver,
          new JSONSchemaTree(config),
        );

  await document.resolver.drain();

  try {
    return String(document);
  } finally {
    document.dispose();
  }
}
