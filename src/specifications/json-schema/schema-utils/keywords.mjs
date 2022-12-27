import ArrayObject from '../array-object.mjs';
import BooleanObject from '../boolean-object.mjs';
import NullObject from '../null-object.mjs';
import NumericObject from '../numeric-object.mjs';
import ObjectObject from '../object-object.mjs';
import StringObject from '../string-object.mjs';

const KEYWORDS = {
  get array() {
    return ArrayObject.keywords;
  },
  boolean: BooleanObject.keywords,
  integer: NumericObject.keywords,
  null: NullObject.keywords,
  number: NumericObject.keywords,
  object: ObjectObject.keywords,
  string: StringObject.keywords,
};

export { KEYWORDS as default };

export function pickKeywordsByType(schema, type) {
  return Object.fromEntries([
    ...KEYWORDS[type]
      .filter(keyword => keyword in schema)
      .map(keyword => [keyword, schema[keyword]]),
    ['type', type],
  ]);
}

export function dropCompoundKeywords(schema) {
  for (const keyword of ['allOf', 'anyOf', 'oneOf']) {
    delete schema[keyword];
  }
}

export function dropAllTypeKeywords(schema) {
  delete schema.type;
}
