import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export async function* readAll(filepaths) {
  for (const filepath of filepaths) {
    const obj = {
      content: await fs.readFile(filepath, 'utf8'),
      filepath,
    };

    yield obj;
  }
}

export async function write(filepath, input, opts) {
  await fs.writeFile(changeBasename(filepath, opts.name), input);
}

function changeBasename(filepath, newBasename) {
  return path.join(path.dirname(filepath), newBasename);
}
