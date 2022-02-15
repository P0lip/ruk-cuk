import generate from '@babel/generator';
import * as t from '@babel/types';
import chai from 'chai';
import { describe, it } from 'mocha';

import OpenAPIObject from '../../../openapi/openapi-object.mjs';
import generateSchemaObject from '../schema-object.mjs';

const { expect } = chai;

function print(object) {
  return generate.default(t.program(generateSchemaObject(object))).code;
}

describe('SchemaObject generator', () => {
  it('handles plain primitives', () => {
    const document = {
      info: {
        title: 'title',
      },
      paths: {},
      components: {
        schemas: {
          Identifier: {
            type: 'string',
          },
        },
      },
    };

    const object = new OpenAPIObject(document).components[0];

    expect(print(object)).to.eq(`type Identifier = string;`);
  });

  it('handles plain objects', () => {
    const document = {
      info: {
        title: 'title',
      },
      paths: {},
      components: {
        schemas: {
          User: {
            title: 'Something else',
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
            },
          },
        },
      },
    };

    const object = new OpenAPIObject(document).components[0];

    expect(print(object)).to.eq(`type User = {
  id?: number;
  [k: string]: unknown;
};`);
  });

  it('handles arrays', () => {
    const document = {
      info: {
        title: 'title',
      },
      paths: {},
      components: {
        schemas: {
          Users: {
            title: 'Something else',
            type: 'array',
            items: {
              $ref: '#/components/schemas/User',
            },
          },
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
      },
    };

    const object = new OpenAPIObject(document).components[0];

    expect(print(object)).to.eq(`type Users = User[];`);
  });

  it('handles $refs pointing at unmapped areas', () => {
    const document = {
      info: {
        title: 'title',
      },
      paths: {},
      components: {
        schemas: {
          Users: {
            title: 'Something else',
            type: 'array',
            items: {
              $ref: '#/components/schemas/User/properties/id',
            },
          },
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
      },
    };

    const object = new OpenAPIObject(document).components[0];

    expect(print(object)).to.eq(`type Users = User["properties"]["id"][];`);
  });

  it('pretty prints comments', () => {
    const document = {
      info: {
        title: 'title',
      },
      paths: {},
      components: {
        schemas: {
          User: {
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
          },
        },
      },
    };

    const object = new OpenAPIObject(document).components[0];

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
});
