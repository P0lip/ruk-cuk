#!/usr/bin/env node
import * as process from 'node:process';

import { readAll, write } from '#cli/io';
import parseArgv from '#cli/parser';
import generate from '#core/codegen';

const argv = parseArgv(process.argv.slice(2));

if (argv.cwd !== process.cwd()) {
  process.chdir(argv.cwd);
}

for await (const { filepath, content } of readAll(argv._)) {
  await write(
    filepath,
    generate(JSON.parse(content), argv.codegen),
    argv.output,
  );
}
