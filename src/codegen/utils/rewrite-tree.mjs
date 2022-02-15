import * as t from '@babel/types';
import * as assert from 'node:assert';

export default function rewriteTree(node, ids) {
  node.trailingComments &&= [];

  switch (node.type) {
    case 'Program':
      for (const [i, child] of node.body.entries()) {
        node.body[i] = rewriteTree(child, ids);
      }

      return node;
    case 'TSInterfaceDeclaration':
      return t.tsTypeAliasDeclaration(
        ids.upsert(node.id.name, t.identifier(node.id.name)),
        void 0,
        rewriteTree(node.body, ids),
      );
    case 'TSInterfaceBody':
      for (const [i, child] of node.body.entries()) {
        node.body[i] = rewriteTree(child, ids);
      }

      return t.tsTypeLiteral(node.body);
    case 'TSTypeLiteral':
      for (const [i, child] of node.members.entries()) {
        node.members[i] = rewriteTree(child, ids);
      }

      return node;
    case 'TSTypeAliasDeclaration':
      node.id = ids.upsert(node.id.name, t.identifier(node.id.name));
      node.typeAnnotation = rewriteTree(node.typeAnnotation, ids);
      return node;
    case 'TSPropertySignature':
    case 'TSIndexSignature':
    case 'TSRestType':
    case 'TSTypeAnnotation':
    case 'TSParenthesizedType':
      node.typeAnnotation = rewriteTree(node.typeAnnotation, ids);
      return node;
    case 'TSIntersectionType':
      for (const [i, child] of node.types.entries()) {
        node.types[i] = rewriteTree(child, ids);
      }

      return node;
    case 'TSArrayType':
      node.elementType = rewriteTree(node.elementType, ids);
      return node;
    case 'TSTupleType':
      for (const [i, child] of node.elementTypes.entries()) {
        node.elementTypes[i] = rewriteTree(child, ids);
      }

      return node;
    case 'TSTypeReference':
      node.typeName = ids.upsert(
        node.typeName.name,
        t.identifier(node.typeName.name),
      );
      return node;
    case 'ExportNamedDeclaration':
      assert.ok(node.exportKind === 'type', 'Invalid export kind');
      return rewriteTree(node.declaration, ids);
    default:
      return node;
  }
}
