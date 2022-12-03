import { compile } from 'refless-json-schema-to-typescript';

import { MapWithUpsert } from '../../utils/objects.mjs';
import parseTypescript from '../utils/parse-typescript.mjs';
import rewriteTree from '../utils/rewrite-tree.mjs';

export default function generateSchemaObject(schemaObject) {
  const safeIdentifiers = [];

  const tree = parseTypescript(
    compile(schemaObject.value, schemaObject.name, {
      bannerComment: '',
      resolveRef(schema) {
        const { name, propertyPath, referencedObject } =
          schemaObject.resolver.resolveObject(schema.$ref);

        safeIdentifiers.push(referencedObject.name);
        return `${name}${propertyPath.join('')}`;
      },
      unknownAny: true,
    }),
    {
      plugins: ['typescript'],
      sourceType: 'module',
    },
  );

  const ids = rewrite(tree);

  ids[0].name = schemaObject.name;
  for (let i = 1; i < ids.length; i++) {
    if (!safeIdentifiers.includes(ids[i].name)) {
      ids[i].name = schemaObject.scope.generateUnique(ids[i].name);
    }
  }

  return tree.body;
}

function rewrite(tree) {
  const ids = new MapWithUpsert();
  rewriteTree(tree, ids);
  return Array.from(ids.values());
}
