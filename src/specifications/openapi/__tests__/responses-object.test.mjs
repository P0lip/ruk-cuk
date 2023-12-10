import '../../openapi/openapi-object.mjs';

import { describe, it } from 'node:test';

import chai from 'chai';

import {
  AjvValidationError,
  assertValidDefinition,
} from '../../../validation/ajv.mjs';

const { expect } = chai;

describe('OpenAPI/Responses Object', () => {
  describe('validation', () => {
    it('given 2XX wildcard response, should disallow any other 2[0-9][0-9] response', () => {
      expect(
        assertValidDefinition.bind(
          null,
          {
            200: {},
            '2XX': {},
          },
          {
            $id: 'ruk-cuk/openapi/responses-object#',
          },
        ),
      ).to.throw(AjvValidationError);
    });
  });
});
