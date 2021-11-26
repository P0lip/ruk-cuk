import * as parser from '@babel/parser';

export default function parseTypescript(input) {
  return parser.parse(input, {
    plugins: ['typescript'],
    sourceType: 'module',
  }).program;
}
