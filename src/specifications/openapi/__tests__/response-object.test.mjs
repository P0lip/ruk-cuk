import '../../openapi/openapi-object.mjs';

import { describe, it } from 'node:test';

import chai from 'chai';

import {
  AjvValidationError,
  assertValidDefinition,
} from '../../../validation/ajv.mjs';

const { expect } = chai;

describe('OpenAPI/Response Object', () => {
  describe('validation', () => {
    it('should accept wildcard mime type', () => {
      expect(
        assertValidDefinition.bind(
          null,
          {
            content: {
              '*/*': {
                schema: {
                  const: 'ok',
                },
              },
            },
          },
          {
            $id: 'ruk-cuk/openapi/response-object#',
          },
        ),
      ).not.to.throw;
    });

    it('given wildcard mime type, should disallow other mime types', () => {
      expect(
        assertValidDefinition.bind(
          null,
          {
            content: {
              '*/*': {
                schema: {
                  const: 'ok',
                },
              },
              'application/json': {},
            },
          },
          {
            $id: 'ruk-cuk/openapi/response-object#',
          },
        ),
      ).to.throw(AjvValidationError);
    });
  });
});
