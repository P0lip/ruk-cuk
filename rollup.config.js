/* eslint-env node */
import { babel } from '@rollup/plugin-babel';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(
  fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'package.json'),
    'utf8',
  ),
);

export default [
  {
    external: id =>
      id.startsWith('@babel/runtime') ||
      id.startsWith('node:') ||
      Object.keys(pkg.dependencies).includes(id),
    input: [
      './src/codegen/index.mjs',
      './src/cli/bootstrap.mjs',
      './src/config/index.mjs',
      './src/config/resolve.node.mjs',
      './src/config/resolve.browser.mjs',
    ],
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].mjs',
        format: 'es',
        name: pkg.name,
        preserveModules: true,
      },
    ],
    plugins: [babel({ babelHelpers: 'bundled' })],
  },
];
