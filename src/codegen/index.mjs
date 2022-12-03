import ContentVirtualObject from '../specifications/openapi/content-virtual-object.mjs';
import OpenAPIObject from '../specifications/openapi/openapi-object.mjs';
import ParameterObject from '../specifications/openapi/parameter-object.mjs';
import PathItemObject from '../specifications/openapi/path-item-object.mjs';
import SchemaObject from '../specifications/openapi/schema-object.mjs';
import Tree from './tree.mjs';

export default function (definition, config) {
  const document = new OpenAPIObject(definition);
  try {
    const tree = new Tree(document, config);

    for (const object of document) {
      switch (true) {
        case object instanceof SchemaObject:
          tree.addComponentsSchemaObject(object);
          break;
        case object instanceof ParameterObject:
          tree.addComponentsParameterObject(object);
          break;
        case object instanceof ContentVirtualObject:
          tree.addSharedContentVirtualObject(object);
          break;
        case object instanceof PathItemObject:
          for (const operationObject of object.operations) {
            tree.addOperationObject(operationObject);
          }

          break;
        default:
          throw new Error('Ooopsa.');
      }
    }

    return String(tree);
  } finally {
    document.dispose();
  }
}
