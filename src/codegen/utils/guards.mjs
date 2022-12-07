const PRIMITIVE_NODE_TYPES = [
  'TSStringKeyword',
  'TSBooleanKeyword',
  'TSNumberKeyword',
  'TSNullKeyword',
];

const NON_HOISTABLE_NODE_TYPES = [
  ...PRIMITIVE_NODE_TYPES,
  'TSLiteralType',
  'TSTypeReference',
  'TSUnknownKeyword',
  'TSNeverKeyword',
];

export function isPrimitiveTypeNode(node) {
  return PRIMITIVE_NODE_TYPES.includes(node.type);
}

export function isPrimitiveLiteralTypeNode(node) {
  return node.type === 'TSLiteralType';
}

export function isHoistable(node) {
  return !NON_HOISTABLE_NODE_TYPES.includes(node.type);
}
