const snakeCaseReplacer = (_, ch) => `_${ch.toUpperCase()}`;
const pascalCaseReplacer = (_, ch) => ch.toUpperCase();

const PATTERN = /[\s_-]+([0-9A-Za-z])/g;

function isEmptyString(str) {
  return str.trim().length === 0;
}

export function toSnakePascalCase(input) {
  return isEmptyString(input)
    ? ''
    : input[0].toUpperCase() +
        input.slice(1).replace(PATTERN, snakeCaseReplacer);
}

export function toPascalCase(input) {
  return isEmptyString(input)
    ? ''
    : input[0].toUpperCase() +
        input.slice(1).replace(PATTERN, pascalCaseReplacer);
}

export function capitalize(input) {
  return isEmptyString(input) ? '' : input[0].toUpperCase() + input.slice(1);
}

export function prepareForBlockComment(input) {
  return [
    `*\n`,
    ...input
      .split('\n')
      .map(item => (item.trim().length === 0 ? ' *' : ` * ${item}`))
      .join('\n'),
    `\n `,
  ].join('');
}
