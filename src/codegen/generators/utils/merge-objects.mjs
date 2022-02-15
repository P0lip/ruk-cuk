import * as t from '@babel/types';
import assert from 'node:assert';

import ReferenceObject from '../../../openapi/reference-object.mjs';
import SchemaObject from '../../../openapi/schema-object.mjs';
import generateReferenceObject from '../reference-object.mjs';
import generateSchemaObject from '../schema-object.mjs';

function pickName(node) {
  if (node.key.type !== 'Identifier') {
    throw new TypeError('Unmergeable object');
  }

  return node.key.name;
}

function mergeTypeLiterMembers(leftMembers, rightMembers) {
  const keys = leftMembers.map(pickName);
  for (const member of rightMembers) {
    if (keys.includes(pickName(member))) {
      throw new TypeError('Unmergeable object');
    }
  }

  leftMembers.push(...rightMembers);
}

function dedupeNodes(node) {
  if (node.type !== 'TSIntersectionType' && node.type !== 'TSUnionType') {
    return node;
  }

  const seen = new Set();
  let curTypeLiteralNode = null;

  for (let i = 0; i < node.types.length; i++) {
    const typeNode = node.types[i];
    switch (typeNode.type) {
      case 'TSTypeReference':
        curTypeLiteralNode = null;
        if (seen.has(typeNode.typeName.name)) {
          node.types.splice(i, 1);
          i--;
        } else {
          seen.add(typeNode.typeName.name);
        }

        break;
      case 'TSTypeLiteral':
        if (curTypeLiteralNode !== null) {
          try {
            mergeTypeLiterMembers(curTypeLiteralNode.members, typeNode.members);
            node.types.splice(i, 1);
            i--;
          } catch {
            curTypeLiteralNode = null;
          }
        } else {
          curTypeLiteralNode = typeNode;
        }

        break;
      default:
        curTypeLiteralNode = null;
    }
  }

  return node;
}

function tryToSchemaObject(object) {
  return 'schema' in object ? object.schema : object;
}

export default function mergeObjects(objects, strategy, name) {
  if (objects.length === 0) {
    return [];
  }

  const intersectable = [];
  const types = [];

  for (const object of objects) {
    const actualObject = tryToSchemaObject(object);
    if (actualObject instanceof ReferenceObject) {
      intersectable.push(generateReferenceObject(actualObject));
      continue;
    }

    if (!(actualObject instanceof SchemaObject)) {
      throw new TypeError('Unmergeable object');
    }

    const declarations = generateSchemaObject(actualObject);

    if (declarations.length === 1) {
      assert.ok(declarations[0].type === 'TSTypeAliasDeclaration');
      intersectable.push(declarations[0].typeAnnotation);
    } else if (declarations.length !== 0) {
      intersectable.push(t.tsTypeReference(declarations[0].id));
      types.push(...declarations);
    }
  }

  const merged = [
    intersectable.length === 1 ? intersectable[0] : t[strategy](intersectable),
    ...types,
  ].map(dedupeNodes);

  return [
    t.tsTypeAliasDeclaration(t.identifier(name), null, merged[0]),
    ...merged.slice(1),
  ];
}
