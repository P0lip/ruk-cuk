import chai from 'chai';
import { describe, it } from 'mocha';
import forEach from 'mocha-each';
import * as fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import generate from '../codegen/index.mjs';

const { expect } = chai;

const cwd = join(fileURLToPath(import.meta.url), '../__fixtures__');

const cases = await (async function traverse(currentDir, items) {
  const ls = await fs.readdir(currentDir);

  for (const item of ls) {
    const itempath = join(currentDir, item);
    const stat = await fs.stat(join(currentDir, item));
    if (stat.isDirectory()) {
      await traverse(itempath, items);
    } else {
      items.add(dirname(itempath).slice(cwd.length + 1));
    }
  }

  return items;
})(cwd, new Set());

describe('Codegen', () => {
  forEach(Array.from(cases), it, describe).describe('given %s', name => {
    it('should match output', async () => {
      const input = JSON.parse(
        await fs.readFile(join(cwd, name, 'input.json'), 'utf8'),
      );
      const output = (
        await fs.readFile(join(cwd, name, 'output.ts'), 'utf8')
      ).trim();

      expect(generate(input, { tsNamespacePrefix: '' }).trim()).to.eq(output);
    });
  });
});
