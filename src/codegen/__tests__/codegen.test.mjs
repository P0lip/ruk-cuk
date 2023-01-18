import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import chai from 'chai';
import { describe, it } from 'mocha';
import forEach from 'mocha-each';

import generate from '../index.mjs';

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
    it('matches output', async () => {
      const input = JSON.parse(
        await fs.readFile(join(cwd, name, 'input.json'), 'utf8'),
      );
      const output = (
        await fs.readFile(join(cwd, name, 'output.ts'), 'utf8')
      ).trim();

      expect(
        generate(input, { namespacePrefix: '', skipEvents: false }).trim(),
      ).to.eq(output);
    });
  });

  it('supports header and footer', () => {
    const input = {
      openapi: '3.1.0',
      info: {
        title: 'My API',
      },
      paths: {},
      components: {},
    };

    expect(
      generate(input, {
        footer: '// I am a footer!',
        header: '// I am a header!',
        namespacePrefix: '',
        skipEvents: false,
      }).trim(),
    ).to.eq(`// I am a header!
declare namespace My_API {
  type Actions = {};
  type Events = never;
}
// I am a footer!`);
  });
});
