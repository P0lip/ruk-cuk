import StandaloneJSONSchemaObject from '../specifications/json-schema/standalone-schema-object.mjs';
import OpenAPIObject from '../specifications/openapi/openapi-object.mjs';
import JSONSchemaTree from './json-schema-tree.mjs';
import OpenAPITree from './openapi-tree.mjs';

export default function generate(source, config) {
  const document =
    'openapi' in source.definition
      ? new OpenAPIObject(source, new OpenAPITree(config))
      : new StandaloneJSONSchemaObject(source, new JSONSchemaTree(config));

  try {
    return String(document);
  } finally {
    document.dispose();
  }
}
