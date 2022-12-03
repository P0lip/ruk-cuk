import generate from '@babel/generator';
import * as t from '@babel/types';
import chai from 'chai';
import { beforeEach, describe, it } from 'mocha';

import OpenAPIObject from '../../../../specifications/openapi/openapi-object.mjs';
import mergeObjects from '../merge-objects.mjs';

const { expect } = chai;

function print(tree) {
  return generate.default(t.program(tree)).code;
}

describe('mergeObjects util', () => {
  let user, address, foreignAddress, extendableAddress, referencedAddress;

  beforeEach(() => {
    [user, address, foreignAddress, extendableAddress, referencedAddress] =
      new OpenAPIObject({
        info: {
          title: 'title',
        },
        paths: {},
        components: {
          schemas: {
            User: {
              additionalProperties: false,
              title: 'Something else',
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                },
              },
            },
            Address: {
              additionalProperties: false,
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                },
              },
            },
            ForeignAddress: {
              additionalProperties: false,
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                },
              },
            },
            ExtendableAddress: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                },
              },
            },
            ReferencedAddress: {
              $ref: '#/components/schemas/ExtendableAddress',
            },
          },
        },
      }).components;
  });

  it('attempts to merge sibling type literals', () => {
    expect(
      print(mergeObjects([user, address], 'tsIntersectionType', 'merged')),
    ).to.eq(
      `type merged = {
  id?: number;
  street?: string;
};`,
    );
  });

  it('refuses to merge sibling type literals containing similar keys', () => {
    expect(
      print(
        mergeObjects([address, foreignAddress], 'tsIntersectionType', 'merged'),
      ),
    ).to.eq(
      `type merged = {
  street?: string;
} & {
  street?: string;
};`,
    );
  });

  it('refuses to merge sibling type literals containing duplicate keys', () => {
    expect(
      print(
        mergeObjects([address, foreignAddress], 'tsIntersectionType', 'merged'),
      ),
    ).to.eq(
      `type merged = {
  street?: string;
} & {
  street?: string;
};`,
    );
  });

  it('refuses to merge sibling type literals containing index keys', () => {
    expect(
      print(
        mergeObjects([user, extendableAddress], 'tsIntersectionType', 'merged'),
      ),
    ).to.eq(
      `type merged = {
  id?: number;
} & {
  street?: string;
  [k: string]: unknown;
};`,
    );
  });

  it('refuses to type literals with other types', () => {
    expect(
      print(
        mergeObjects([user, referencedAddress], 'tsIntersectionType', 'merged'),
      ),
    ).to.eq(
      `type merged = {
  id?: number;
} & ExtendableAddress;`,
    );
  });
});
