import generate from '@babel/generator';

export default function printTree(tree) {
  return generate.default(tree).code;
}
