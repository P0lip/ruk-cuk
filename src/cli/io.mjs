import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import chalk from 'chalk';

export async function* readAll(filepaths) {
  for (const filepath of filepaths) {
    yield read(filepath);
  }
}

export async function read(filepath) {
  return {
    content: await fs.readFile(filepath, 'utf8'),
    filepath,
  };
}

export async function write(filepath, input, opts) {
  const outputPath =
    path.dirname(opts.output) === '.'
      ? // replace basename if output contains file name
        changeBasename(filepath, opts.output)
      : // use the full file path otherwise
        opts.output;

  await fs.writeFile(outputPath, input);

  if (!opts.quiet) {
    process.stdout.write(
      chalk.green(`Written ${outputPath} for ${filepath}\n`),
    );
  }
}

function changeBasename(filepath, newBasename) {
  return path.join(path.dirname(filepath), newBasename);
}
