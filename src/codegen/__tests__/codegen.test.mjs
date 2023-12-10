import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import chai from 'chai';
import forEach from 'mocha-each';

import SourceDocument from '../../core/source-document.mjs';
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
  forEach(Array.from(cases), it, describe).describe('given %s', async name => {
    it(`matches output ${name}`, async () => {
      const source = join(cwd, name, 'input.json');
      const input = JSON.parse(await fs.readFile(source, 'utf8'));
      const output = (
        await fs.readFile(join(cwd, name, 'output.ts'), 'utf8')
      ).trim();

      expect(
        (
          await generate(
            new SourceDocument(input, source),
            {
              namespacePrefix: '',
              skipEvents: false,
            },
            fs,
          )
        ).trim(),
      ).to.eq(output);
    });
  });

  it('supports header and footer', async () => {
    const input = {
      openapi: '3.1.0',
      info: {
        title: 'My API',
      },
      paths: {},
      components: {},
    };

    expect(
      (
        await generate(
          new SourceDocument(input, null),
          {
            footer: '// I am a footer!',
            header: '// I am a header!',
            namespacePrefix: '',
            skipEvents: false,
          },
          fs,
        )
      ).trim(),
    ).to.eq(`// I am a header!
declare namespace My_API {
  type Actions = {};
  type Events = never;
}
// I am a footer!`);
  });
});
