import StandaloneJSONSchemaObject from '../specifications/json-schema/standalone-schema-object.mjs';
import OpenAPIObject from '../specifications/openapi/openapi-object.mjs';
import JSONSchemaTree from './json-schema-tree.mjs';
import OpenAPITree from './openapi-tree.mjs';

export default function (definition, config) {
  const document =
    'openapi' in definition
      ? new OpenAPIObject(definition, new OpenAPITree(config))
      : new StandaloneJSONSchemaObject(definition, new JSONSchemaTree(config));

  try {
    return String(document);
  } finally {
    document.dispose();
  }
}
