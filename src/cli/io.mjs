import chalk from 'chalk';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

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
  const outputPath = changeBasename(filepath, opts.output);
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
