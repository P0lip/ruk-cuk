import chai from 'chai';
import { describe, it } from 'mocha';

import { AjvValidationError } from '../../validation/ajv.mjs';
import ResponseObject from '../response-object.mjs';

const { expect } = chai;

describe('OpenAPI/Response Object', () => {
  describe('validation', () => {
    it('should accept wildcard mime type', () => {
      expect(
        () =>
          new ResponseObject(
            {
              content: {
                '*/*': {
                  schema: {
                    const: 'ok',
                  },
                },
              },
            },
            [],
            null,
          ),
      ).not.to.throw;
    });

    it('given wildcard mime type, should disallow other mime types', () => {
      expect(
        () =>
          new ResponseObject(
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
            [],
            null,
          ),
      ).to.throw(AjvValidationError);
    });
  });
});
