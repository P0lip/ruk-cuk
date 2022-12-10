import OpenAPIObject from '../specifications/openapi/openapi-object.mjs';
import PathItemObject from '../specifications/openapi/path-item-object.mjs';
import Tree from './tree.mjs';

export default function (definition, config) {
  const document = new OpenAPIObject(definition);
  try {
    const tree = new Tree(document, config);

    for (const object of document) {
      if (object instanceof PathItemObject) {
        for (const operationObject of object.operations) {
          tree.addOperationObject(operationObject);
        }
      } else {
        tree.addObject(object);
      }
    }

    return String(tree);
  } finally {
    document.dispose();
  }
}
