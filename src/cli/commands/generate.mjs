import generate from '#core/codegen';

import { read, readAll, write } from '../io.mjs';

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
        const { filepath, content } = await read(path);
        await write(filepath, generate(JSON.parse(content), argv), argv);
      });
    }

    for await (const { filepath, content } of readAll(argv.documents)) {
      await write(filepath, generate(JSON.parse(content), argv), argv);
    }
  },
};
