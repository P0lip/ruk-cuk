export function extractRukCukNameExtension(definition) {
  const value = definition['x-ruk-cuk-name'];
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length === 0 ? null : trimmedValue;
}
