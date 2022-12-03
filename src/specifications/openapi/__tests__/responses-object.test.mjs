import chai from 'chai';
import { describe, it } from 'mocha';

import { AjvValidationError } from '../../../validation/ajv.mjs';
import ResponsesObject from '../responses-object.mjs';

const { expect } = chai;

describe('OpenAPI/Responses Object', () => {
  describe('validation', () => {
    it('given 2XX wildcard response, should disallow any other 2[0-9][0-9] response', () => {
      expect(
        () =>
          new ResponsesObject({
            200: {},
            '2XX': {},
          }),
      ).to.throw(AjvValidationError);
    });

    it('given 2XX wildcard response, should disallow any other 2[0-9][0-9] response', () => {
      expect(
        () =>
          new ResponsesObject({
            200: {},
            '2XX': {},
          }),
      ).to.throw(AjvValidationError);
    });
  });
});
