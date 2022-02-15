import * as assert from 'node:assert';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import { CONFIG_NAME } from './consts.mjs';
import { NotFoundError } from './errors.mjs';

function exit(cwd) {
  const out = path.join(cwd, '..');
  assert.ok(out !== cwd, new NotFoundError('root reached'));
  return out;
}

export default async function resolveConfig(documentUri) {
  let cwd = exit(
    path.isAbsolute(documentUri)
      ? documentUri
      : path.join(process.cwd(), documentUri),
  );
  while (!(await fs.readdir(cwd)).includes(CONFIG_NAME)) {
    cwd = exit(cwd);
  }

  return await fs.readFile(path.join(cwd, CONFIG_NAME), 'utf8');
}
