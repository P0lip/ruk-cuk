export default function isSafeIdentifier(value) {
  return (
    value.replace(/[^$_0-9A-Za-z]/g, '').replace(/^([0-9])/, '_$1') === value
  );
}
