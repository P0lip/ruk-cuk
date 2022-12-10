import generate from '@babel/generator';
import chai from 'chai';
import { describe, it } from 'mocha';

import SchemaObject from '../schema-object.mjs';

const { expect } = chai;

function print(object) {
  return generate.default(object.build()).code;
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

  it('handles plain objects', () => {
    const document = {
      title: 'Something else',
      type: 'object',
      properties: {
        id: {
          type: 'integer',
        },
      },
    };

    const object = new SchemaObject(document, null, 'User');

    expect(print(object)).to.eq(`type User = {
  id?: number;
  [k: string]: unknown;
};`);
  });

  it('handles arrays', () => {
    const document = {
      type: 'array',
      items: {
        $ref: '#/$defs/User',
      },
      $defs: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
          },
          required: ['id'],
          additionalProperties: false,
        },
      },
    };

    const object = new SchemaObject(document, null, 'Users');

    expect(print(object)).to.eq(`type Users = Users_User[];
type Users_User = {
  id: number;
};`);
  });

  it('handles $refs pointing at unmapped areas', () => {
    const document = {
      title: 'Something else',
      type: 'array',
      items: {
        oneOf: [
          {
            $ref: '#/$defs/User/properties/id',
          },
          {
            $ref: '#/x-defs/User/properties/id',
          },
        ],
      },
      $defs: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
          },
          required: ['id'],
          additionalProperties: false,
        },
      },
      'x-defs': {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
          },
          required: ['id'],
          additionalProperties: false,
        },
      },
    };

    const object = new SchemaObject(document, null, 'User');

    expect(print(object)).to.eq(`type User = (string | number)[];
type User_User = {
  id: string;
};`);
  });

  it('pretty prints comments', () => {
    const document = {
      type: 'object',
      properties: {
        id: {
          description: 'Unique identifier',
          type: 'integer',
        },
        name: {
          description: 'Name of a user',
          type: 'integer',
        },
      },
      required: ['id'],
      additionalProperties: false,
    };

    const object = new SchemaObject(document, null, 'User');

    expect(print(object)).to.eq(`type User = {
  /**
   * Unique identifier
   */
  id: number;

  /**
   * Name of a user
   */
  name?: number;
};`);
  });

  it('uses Record where applicable', () => {
    const document = {
      anyOf: [
        {
          type: 'object',
        },
        {
          type: 'object',
          additionalProperties: {
            type: 'number',
          },
        },
        {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              test: {
                type: 'string',
              },
            },
            additionalProperties: false,
          },
        },
      ],
    };

    const object = new SchemaObject(document, null, 'Dictionary');

    expect(print(object)).to.eq(
      `type Dictionary = Record<string, unknown> | Record<string, number> | Record<string, {
  test?: string;
}>;`,
    );
  });
});
