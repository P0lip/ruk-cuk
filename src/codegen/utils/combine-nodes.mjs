import * as assert from 'node:assert';

import * as t from '@babel/types';

import merge from './merge.mjs';

export default function combineNodes(nodes, strategy, name) {
  if (nodes.length === 0) {
    return t.program([]);
  }

  const intersectable = [];
  const types = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'TSTypeAliasDeclaration':
        intersectable.push(node.typeAnnotation);
        break;
      case 'TSTypeReference':
        intersectable.push(node);
        break;
      case 'Program': {
        const declarations = node.body;
        if (declarations.length === 1) {
          assert.ok(declarations[0].type === 'TSTypeAliasDeclaration');
          intersectable.push(declarations[0].typeAnnotation);
        } else if (declarations.length !== 0) {
          intersectable.push(t.tsTypeReference(declarations[0].id));
          types.push(...declarations);
        }

        break;
      }
      default:
        throw TypeError('Unmergeable object');
    }
  }

  const merged = [
    intersectable.length === 1 ? intersectable[0] : t[strategy](intersectable),
    ...types,
  ].map(merge);

  return t.program([
    t.tsTypeAliasDeclaration(t.identifier(name), null, merged[0]),
    ...merged.slice(1),
  ]);
}
