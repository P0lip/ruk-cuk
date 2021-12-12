import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import generateCommand from './commands/generate.mjs';

export default function (process) {
  yargs(hideBin(process.argv))
    .parserConfiguration({
      'camel-case-expansion': true,
    })
    .version()
    .help(true)
    .strictCommands()
    .strictOptions()
    .showHelpOnFail(true)
    .command(generateCommand).argv;
}
