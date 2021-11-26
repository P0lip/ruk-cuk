const snakeCaseReplacer = (_, ch) => `_${ch.toUpperCase()}`;

const R = /[_-]([a-z])/g;

function isEmptyString(str) {
  return str.trim().length === 0;
}

export function toCapitalSnakeCase(input) {
  return isEmptyString(input)
    ? ''
    : input[0].toUpperCase() + input.slice(1).replace(R, snakeCaseReplacer);
}

export function toPascalCase(input) {
  return isEmptyString(input)
    ? ''
    : input[0].toUpperCase() +
        input.slice(1).replace(R, (_, l) => `${l.toUpperCase()}`);
}

export function capitalize(input) {
  return isEmptyString(input) ? '' : input[0].toUpperCase() + input.slice(1);
}
