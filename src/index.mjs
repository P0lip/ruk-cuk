import Tree from './codegen/tree.mjs';
import OpenAPIObject from './openapi/openapi-object.mjs';
import ParameterObject from './openapi/parameter-object.mjs';
import PathItemObject from './openapi/path-item-object.mjs';
import SchemaObject from './openapi/schema-object.mjs';

export default function (definition, { tsNamespacePrefix }) {
  const document = new OpenAPIObject(definition);
  try {
    const tree = new Tree(`${tsNamespacePrefix}${document.name}`);

    for (const object of document) {
      switch (true) {
        case object instanceof SchemaObject:
          tree.addComponentsSchemaObject(object);
          break;
        case object instanceof ParameterObject:
          tree.addComponentsParameterObject(object);
          break;
        case object instanceof PathItemObject:
          for (const operationObject of object.operations) {
            tree.addOperationObject(operationObject);
          }

          break;
      }
    }

    return String(tree);
  } finally {
    document.dispose();
  }
}
