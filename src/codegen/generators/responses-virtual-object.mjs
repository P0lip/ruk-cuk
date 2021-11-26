import * as t from '@babel/types';
import * as assert from 'node:assert';

import ReferenceObject from '../../openapi/reference-object.mjs';
import generateReferenceObject from './reference-object.mjs';
import generateSchemaObject from './schema-object.mjs';

function mergeSchemasOrReferenceObjects(schemaOrReferenceObjects) {
  if (schemaOrReferenceObjects.length === 0) {
    return null;
  }

  const intersectable = [];
  const types = [];

  for (const object of schemaOrReferenceObjects) {
    if (object instanceof ReferenceObject) {
      intersectable.push(generateReferenceObject(object));
      continue;
    }

    const declarations = generateSchemaObject(object);

    if (declarations.length === 1) {
      assert.ok(declarations[0].type === 'TSTypeAliasDeclaration');
      intersectable.push(declarations[0].typeAnnotation);
    } else if (declarations.length !== 0) {
      intersectable.push(t.tsTypeReference(declarations[0].id));
      types.push(...declarations);
    }
  }

  return [
    intersectable.length === 1
      ? intersectable[0]
      : t.tsIntersectionType(intersectable),
    ...types,
  ];
}

function toSchemaOrReferenceObject(object) {
  return 'schema' in object ? object.schema : object;
}

export default function generateResponsesVirtualObject(responsesVirtualObject) {
  const merged = mergeSchemasOrReferenceObjects(
    Array.from(responsesVirtualObject).map(toSchemaOrReferenceObject),
  );

  if (merged === null) {
    return [];
  }

  return [
    t.tsTypeAliasDeclaration(
      t.identifier(responsesVirtualObject.name),
      null,
      merged[0],
    ),
    ...merged.slice(1),
  ];
}
