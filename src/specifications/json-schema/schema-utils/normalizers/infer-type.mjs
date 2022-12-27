import KEYWORDS from '../keywords.mjs';

export default function inferType(schema) {
  if (schema.type !== void 0) return;

  const matchedTypes = [];
  for (const [type, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(keyword => keyword !== 'type' && keyword in schema)) {
      matchedTypes.push(type);
    }
  }

  if (matchedTypes.length === 1) {
    schema.type = matchedTypes[0];
  } else if (matchedTypes.length > 1) {
    schema.type = matchedTypes;
  }
}
