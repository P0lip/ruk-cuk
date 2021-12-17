import prettier from 'prettier';

import generate from '#core/codegen';

import { read, readAll, write } from '../io.mjs';

const CONFIG_CACHE = {};

async function writeWithPrettify({ filepath, content }, argv) {
  let code = generate(JSON.parse(content), argv);

  if (argv.prettify) {
    code = prettier.format(code, {
      ...(CONFIG_CACHE[filepath] ??= await prettier.resolveConfig(filepath)),
      parser: 'typescript',
    });
  }

  await write(filepath, code, argv);
}

export default {
  builder: yargs =>
    yargs
      .strict()
      .positional('documents', {
        description: 'Location of 3.x OpenAPI documents.',
      })
      .check(argv => {
        if (!Array.isArray(argv.documents) || argv.documents.length === 0) {
          throw new TypeError('No documents provided.');
        }

        return true;
      })
      .options({
        output: {
          alias: 'o',
          default: 'types.d.ts',
          description: 'The name of the file to store definitions as',
          type: 'string',
        },
        prettify: {
          default: true,
          description: 'Use Prettier to format the output code',
          type: 'boolean',
        },
        quiet: {
          alias: 'q',
          default: false,
          description: 'Print nothing but errors',
          type: 'boolean',
        },
        'ts-namespace-prefix': {
          default: '',
          description: 'Prefix used within the TypeScript declaration name',
          type: 'string',
        },
        watch: {
          alias: 'w',
          default: false,
          description: 'Watch document and rebuild on changes',
          type: 'boolean',
        },
      }),
  command: 'generate [documents..]',
  describe:
    'generate Moleculer-compliant TypeScript signatures from 3.x OpenAPI documents',
  handler: async argv => {
    if (argv.watch) {
      const chokidar = await import('chokidar');
      const watcher = chokidar.watch(argv.documents);
      watcher.on('change', async path => {
        await writeWithPrettify(await read(path), argv);
      });
    }

    for await (const entry of readAll(argv.documents)) {
      await writeWithPrettify(entry, argv);
    }
  },
};
