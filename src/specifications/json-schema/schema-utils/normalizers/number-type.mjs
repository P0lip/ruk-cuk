export default function normalizeNumberType(schema) {
  const types = schema.type;
  if (!Array.isArray(types)) return;

  const numberIndex = types.indexOf('number');
  if (types.includes('integer')) {
    types.splice(numberIndex, 1);
  }

  for (let i = types.length - 1; i > 0; i--) {
    if (types.indexOf(types[i]) !== i) {
      types.splice(i, 1);
    }
  }
}
