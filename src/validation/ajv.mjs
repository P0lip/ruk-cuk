import Ajv from 'ajv';

const ajv = new Ajv({ strict: true });

export class AjvValidationError extends AggregateError {
  constructor(errors) {
    super(
      errors.map(
        e => new Error(`${e.instancePath} ${e.message}`, { cause: e }),
      ),
    );
  }
}

export function registerSchema(schema) {
  ajv.addSchema(schema);
  return schema;
}

export function assertValidDefinition(definition, schema) {
  const validate = ajv.getSchema(schema.$id);
  if (!validate(definition)) {
    throw new AjvValidationError(validate.errors ?? []);
  }
}
