import * as fs from 'node:fs/promises';
import { describe, it } from 'node:test';

import chai from 'chai';

import JSONSchemaTree from '../../../codegen/json-schema-tree.mjs';
import Resolver from '../../../core/resolver.mjs';
import SourceDocument from '../../../core/source-document.mjs';
import StandaloneJSONSchemaObject from '../standalone-schema-object.mjs';

const { expect } = chai;

function print(document) {
  const sourceDocument = new SourceDocument(document, null);
  const resolver = new Resolver(sourceDocument, fs);
  return String(
    new StandaloneJSONSchemaObject(
      sourceDocument,
      resolver,
      new JSONSchemaTree(document),
      document.title ?? 'Model',
    ),
  );
}

describe('SchemaObject generator', () => {
  it('handles plain primitives', () => {
    const document = {
      type: 'string',
    };

    expect(print(document)).to.eq(`type Model = string;`);
  });

  it('handles type placed alongside a oneOf', () => {
    const document = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
      oneOf: [
        {
          type: 'object',
          properties: {
            length: {
              type: 'number',
            },
          },
          required: ['length'],
        },
        {
          type: 'object',
          properties: {
            size: {
              type: 'number',
            },
          },
          required: ['size'],
        },
      ],
    };

    expect(print(document)).to.eq(`type Model = {
  id?: string;
  [k: string]: unknown;
} & ({
  length: number;
  [k: string]: unknown;
} | {
  size: number;
  [k: string]: unknown;
});`);
  });

  it('implicit types', () => {
    const document = {
      type: 'object',
      oneOf: [
        {
          additionalProperties: false,
          properties: {
            kind: {
              const: 'user',
            },
            traits: {
              properties: {
                name: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
          },
          required: ['kind'],
        },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            kind: {
              const: 'guest',
            },
          },
          required: ['kind'],
        },
      ],
    };

    expect(print(document)).to.eq(`type Model = {
  kind: "user";
  traits?: {
    name?: string;
  };
} | {
  kind: "guest";
};`);
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
              properties: {},
            },
          ],
        },
        c: false,
        d: true,
      },
      required: ['b'],
      type: 'object',
    };

    expect(print(document)).to.eq(`type Model = {
  a?: string;
  b: [number, number | string, unknown, Record<string, unknown>];
  c?: never;
  d?: unknown;
  [k: string]: unknown;
};`);
  });

  it('handles plain objects', () => {
    const document = {
      title: 'User',
      type: 'object',
      properties: {
        id: {
          type: 'integer',
        },
      },
    };

    expect(print(document)).to.eq(`type User = {
  id?: number;
  [k: string]: unknown;
};`);
  });

  it('handles arrays', () => {
    const document = {
      title: 'Users',
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

    expect(print(document)).to.eq(`type Users = Users_User[];
type Users_User = {
  id: number;
};`);
  });

  it('handles $refs pointing at unmapped areas', () => {
    const document = {
      title: 'Users',
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

    expect(print(document)).to.eq(`type Users = (string | number)[];
type Users_User = {
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

    expect(print(document)).to.eq(`type Model = {
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

    expect(print(document)).to.eq(
      `type Model = Record<string, unknown> | Record<string, number> | Record<string, {
  test?: string;
}>;`,
    );
  });
});
