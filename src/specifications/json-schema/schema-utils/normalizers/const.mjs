import * as assert from 'node:assert';

function assertValidConstUsage(schema) {
  // we omit oneOf/anyOf/allOf and other compound keywords
  if ('enum' in schema) {
    assert.ok(
      schema.enum.includes(schema.const),
      'Const used, but not declared in an enum',
    );
  }
}

export default function normalizeConst(schema) {
  if ('const' in schema) {
    assertValidConstUsage(schema);
    schema.enum = [schema.const];
    delete schema.type;
  }
}
