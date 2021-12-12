import generate from '#core/codegen';

import { readAll, write } from '../io.mjs';

export default {
  builder: yargs =>
    yargs
      .strict()
      .positional('documents', {
        description: 'Location of JSON OpenAPI documents.',
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
        'ts-namespace-prefix': {
          default: '',
          description: 'Prefix used within the TypeScript declaration name',
          type: 'string',
        },
      }),
  command: 'generate [documents..]',
  describe:
    'generate Moleculer-compliant TypeScript signatures from OpenAPI documents',
  handler: async argv => {
    for await (const { filepath, content } of readAll(argv.documents)) {
      await write(filepath, generate(JSON.parse(content), argv), argv);
    }
  },
};
