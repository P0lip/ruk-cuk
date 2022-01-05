import Ajv from 'ajv';
import AggregateError from 'es-aggregate-error';
import * as assert from 'node:assert';

const ajv = new Ajv({ strict: true });

export class AjvValidationError extends AggregateError {}

export function registerSchema(schema) {
  ajv.addSchema(schema);
  return schema;
}

export function assertValidDefinition(definition, schema) {
  const validate = ajv.getSchema(schema.$id);
  assert.ok(
    validate(definition),
    new AjvValidationError(validate.errors ?? []),
  );
}
