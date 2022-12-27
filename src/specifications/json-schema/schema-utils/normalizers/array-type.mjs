import { pickKeywordsByType } from '../keywords.mjs';

export default function normalizeArrayType(schema) {
  const types = schema.type;
  if (!Array.isArray(types)) return;
  if (types.length === 1) {
    schema.type = types[0];
    return;
  }

  const schemas = types.map(type => pickKeywordsByType(schema, type));
  const collectedKeywords = schemas.flatMap(Object.keys);
  for (const keyword of collectedKeywords) {
    delete schema[keyword];
  }

  if ('oneOf' in schema) {
    schema.allOf ??= [];
    schema.allOf.push({
      oneOf: schemas,
    });
  } else {
    schema.oneOf = schemas;
  }
}
