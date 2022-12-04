import generate from '@babel/generator';
import * as t from '@babel/types';
import chai from 'chai';
import { describe, it } from 'mocha';

import SchemaObject from '../schema-object.mjs';

const { expect } = chai;

function print(object) {
  return generate.default(t.program(object.build())).code;
}

describe('SchemaObject generator', () => {
  it('handles plain primitives', () => {
    const document = {
      type: 'string',
    };

    const object = new SchemaObject(document, null, 'Identifier');

    expect(print(object)).to.eq(`type Identifier = string;`);
  });

  it('golden', () => {
    const document = {
      properties: {
        a: {
          type: 'string',
        },
        b: {
          type: 'array',
          items: [
            {
              type: 'number',
            },
            {
              type: ['number', 'integer', 'string'],
            },
            true,
            {
              type: 'object',
              properties: {
                // a: true,
              },
            },
          ],
        },
        c: false,
        d: true,
      },
      required: ['b'],
      type: 'object',
    };

    const object = new SchemaObject(document, null, 'Schema');

    expect(print(object)).to.eq(`type Schema = {
  a?: string;
  b: [number, number | string, unknown, Record<string, unknown>];
  c?: never;
  d?: unknown;
  [k: string]: unknown;
};`);
  });
});
