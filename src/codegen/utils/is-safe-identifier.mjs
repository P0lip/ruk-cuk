import safeIdentifier from './safe-identifier.mjs';

export default function isSafeIdentifier(value) {
  return safeIdentifier(value) === value;
}
