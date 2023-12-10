import { describe, it } from 'node:test';

import chai from 'chai';
import forEach from 'mocha-each';

import { toPascalCase, toSnakePascalCase } from '../strings.mjs';

const { expect } = chai;

describe('String utils', () => {
  forEach(
    [
      ['', { pascal: '', snakePascal: '' }],
      ['a', { pascal: 'A', snakePascal: 'A' }],
      ['Billing api', { pascal: 'BillingApi', snakePascal: 'Billing_Api' }],
      [
        'Activity Logs',
        { pascal: 'ActivityLogs', snakePascal: 'Activity_Logs' },
      ],
      ['workspace_id', { pascal: 'WorkspaceId', snakePascal: 'Workspace_Id' }],
      [
        'not-found-error',
        { pascal: 'NotFoundError', snakePascal: 'Not_Found_Error' },
      ],
      ['error 404', { pascal: 'Error404', snakePascal: 'Error_404' }],
      ['error - 404', { pascal: 'Error404', snakePascal: 'Error_404' }],
    ],
    it,
    describe,
  ).describe('given %s', (input, { pascal, snakePascal }) => {
    it('#toPascalCase should convert to pascal case', () => {
      expect(toPascalCase(input)).to.eq(pascal);
    });

    it('#toSnakePascalCase should convert to snake pascal case', () => {
      expect(toSnakePascalCase(input)).to.eq(snakePascal);
    });
  });
});
