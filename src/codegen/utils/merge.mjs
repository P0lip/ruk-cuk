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

function dedupeTypeReferences(node) {
  const seen = new Set();

  for (let i = 0; i < node.types.length; i++) {
    const typeNode = node.types[i];
    if (typeNode.type !== 'TSTypeReference') continue;
    if (typeNode.typeParameters && typeNode.typeParameters.params.length > 0) {
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

export default function merge(node) {
  switch (node.type) {
    case 'TSIntersectionType':
      dedupeTypeLiterals(node, false);
      dedupeTypeReferences(node);
      break;
    case 'TSUnionType':
      dedupeTypeReferences(node);
      dedupeTypeLiterals(node, true);
      break;
  }

  return node;
}
