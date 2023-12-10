import * as t from '@babel/types';

import { isPrimitiveLiteralTypeNode, isPrimitiveTypeNode } from './guards.mjs';

function pickName(node) {
  if (node.type !== 'TSPropertySignature') return null;
  switch (node.key.type) {
    case 'Identifier':
      return node.key.name;
    case 'StringLiteral':
      return node.key.value;
    default:
      throw new TypeError('Could not get name');
  }
}

function unwrapTupleMember(node) {
  return node.type === 'TSNamedTupleMember' ? node.elementType : node;
}

function isEqualTuple(left, right, diff) {
  if (left.elementTypes.length !== right.elementTypes.length) return false;

  for (let i = 0; i < left.elementTypes.length; i++) {
    const leftType = unwrapTupleMember(left.elementTypes[i]);
    const rightType = unwrapTupleMember(right.elementTypes[i]);

    if (!isEqual(leftType, rightType, diff)) return false;
  }

  return true;
}

function isEqualTypeLiteral(left, right, diff) {
  const leftMembers = groupByKeys(left.members);
  const rightMembers = groupByKeys(right.members);

  for (const key of Reflect.ownKeys(rightMembers)) {
    if (!(key in leftMembers)) {
      diff.add({
        kind: 'add',
        member: rightMembers[key],
      });
      continue;
    }

    const leftProperty = leftMembers[key];
    const rightProperty = rightMembers[key];

    if (leftProperty.optional !== rightProperty.optional) {
      diff.add({
        kind: 'change',
        member: leftProperty,
        value: {
          optional: false,
        },
      });
    }

    if (
      !isEqual(leftProperty.typeAnnotation, rightProperty.typeAnnotation, diff)
    ) {
      return false;
    }
  }

  return true;
}

function isCompatibleComplexType(left, right, diff) {
  switch (left.type) {
    case 'TSTypeAnnotation':
      return (
        right.type === 'TSTypeAnnotation' &&
        isEqual(left.typeAnnotation, right.typeAnnotation, diff)
      );
    case 'TSArrayType':
      return (
        right.type === 'TSArrayType' &&
        isEqual(left.elementType, right.elementType, diff)
      );
    case 'TSTupleType':
      return right.type === 'TSTupleType' && isEqualTuple(left, right, diff);
    case 'TSRestType':
      return (
        right.type === 'TSRestType' &&
        isEqual(left.typeAnnotation, right.typeAnnotation)
      );
    case 'TSTypeLiteral':
      return (
        right.type === 'TSTypeLiteral' && isEqualTypeLiteral(left, right, diff)
      );
    default:
      return false;
  }
}

function isEqual(left, right, diff) {
  switch (true) {
    case isPrimitiveTypeNode(left):
    case left.type === 'TSUnknownKeyword':
    case left.type === 'TSNeverKeyword':
      return left.type === right.type;
    case isPrimitiveLiteralTypeNode(left):
      return (
        left.type === right.type && left.literal.value === right.literal.value
      );
    default:
      return isCompatibleComplexType(left, right, diff);
  }
}

function groupByKeys(members) {
  return Object.fromEntries(
    members
      .map(member => [pickName(member), member])
      .filter(([key]) => key !== null),
  );
}

function dedupeTypeLiterals(node, strict) {
  const start = node.types.findIndex(node => node.type === 'TSTypeLiteral');
  if (start === -1) return;
  const firstTSTypeLiteral = node.types[start];

  for (let i = start + 1; i < node.types.length; i++) {
    const typeNode = node.types[i];
    if (typeNode.type !== 'TSTypeLiteral') continue;

    const diff = new Set();

    if (isCompatibleComplexType(firstTSTypeLiteral, typeNode, diff)) {
      if (strict && diff.size !== 0) return;

      for (const change of diff) {
        switch (change.kind) {
          case 'add':
            firstTSTypeLiteral.members.push(change.member);
            break;
          case 'change':
            Object.assign(change.member, change.value);
            break;
        }
      }

      node.types.splice(i, 1);
      i--;
    } else {
      return;
    }
  }
}

function dedupeTypeParameterInstantiation(params, node) {
  if (node.typeName.type !== 'Identifier') return false;
  if (node.typeParameters.params.length !== 2) return false;
  if (node.typeParameters.params[0].type !== 'TSTypeReference') return false;
  if (node.typeParameters.params[0].typeName.type !== 'Identifier')
    return false;

  const existingType = params.get(node.typeName.name);
  if (existingType === void 0) {
    params.set(
      node.typeName.name,
      new Map([
        [
          node.typeParameters.params[0].typeName.name,
          node.typeParameters.params,
        ],
      ]),
    );
    return false;
  }

  const existingParams = existingType.get(
    node.typeParameters.params[0].typeName.name,
  );

  if (existingParams === void 0) {
    existingType.set(
      node.typeParameters.params[0].typeName.name,
      node.typeParameters.params,
    );
    return false;
  }

  if (existingParams[1].type !== 'TSTypeLiteral') {
    existingParams[1] = t.tsUnionType([
      existingParams[1],
      node.typeParameters.params[1],
    ]);
  } else {
    existingParams[1].types.push(node.typeParameters.params[1]);
  }

  return true;
}

function dedupeTypeReferences(node) {
  const seen = new Set();
  const params = new Map();

  for (let i = 0; i < node.types.length; i++) {
    const typeNode = node.types[i];
    if (typeNode.type !== 'TSTypeReference') continue;
    if (
      typeNode.typeParameters?.type === 'TSTypeParameterInstantiation' &&
      typeNode.typeParameters.params.length > 0
    ) {
      if (dedupeTypeParameterInstantiation(params, typeNode)) {
        node.types.splice(i, 1);
        i--;
      }

      continue;
    }

    if (typeNode.typeName.type !== 'Identifier') continue;

    if (seen.has(typeNode.typeName.name)) {
      node.types.splice(i, 1);
      i--;
    } else {
      seen.add(typeNode.typeName.name);
    }
  }
}

export function dedupeKeywords(node) {
  const seen = new Set();

  const keywords = [
    'TSUnknownKeyword',
    'TSNullKeyword',
    'TSBooleanKeyword',
    'TSNumberKeyword',
    'TSStringKeyword',
  ];

  for (let i = 0; i < node.types.length; i++) {
    if (!keywords.includes(node.types[i].type)) {
      continue;
    }

    if (seen.has(node.types[i].type)) {
      node.types.splice(i, 1);
      i--;
    } else {
      seen.add(node.types[i].type);
    }
  }
}

export default function merge(node) {
  switch (node.type) {
    case 'TSIntersectionType':
      dedupeKeywords(node);
      dedupeTypeLiterals(node, false);
      dedupeTypeReferences(node);
      break;
    case 'TSUnionType':
      dedupeKeywords(node);
      dedupeTypeReferences(node);
      dedupeTypeLiterals(node, true);
      break;
  }

  return node;
}
