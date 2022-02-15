import { parseWithPointers } from '@stoplight/json';

export default function parse(content) {
  return parseWithPointers(content).data;
}
