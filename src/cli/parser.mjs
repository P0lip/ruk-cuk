import hasIn from 'lodash.hasin';
import set from 'lodash.set';
import * as process from 'node:process';

export default function parseArgv(argv) {
  const opts = {
    _: [],
    codegen: {
      namespace: '',
    },
    cwd: process.cwd(),
    output: {
      name: 'types.d.ts',
    },
  };

  for (const arg of argv) {
    switch (true) {
      case arg.startsWith('--') &&
        hasIn(opts, arg.slice(2, arg.indexOf('='))): {
        const [keyPath, value] = arg.slice(2).split('=');
        set(opts, keyPath.split('.'), value);
        break;
      }
      case arg.startsWith('--'):
        throw new Error('Unknown argument');
      default:
        opts._.push(arg);
    }
  }

  return opts;
}
