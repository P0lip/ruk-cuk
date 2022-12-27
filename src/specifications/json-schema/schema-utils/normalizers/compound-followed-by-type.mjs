import { pickKeywordsByType } from '../keywords.mjs';

export default function normalizeCompoundFollowedByType(schema) {
  if (schema.type === void 0) return;
  if (schema.oneOf === void 0 && schema.anyOf === void 0) return;

  const keywords = Object.keys(pickKeywordsByType(schema, schema.type));
  for (const elem of [...(schema.oneOf ?? []), ...(schema.anyOf ?? [])]) {
    if (!('type' in elem)) {
      elem.type = schema.type;
    }
  }

  if (keywords.length === 1 && keywords[0] === 'type') {
    delete schema.type;
  }
}
