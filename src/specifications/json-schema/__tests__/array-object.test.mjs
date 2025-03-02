import { describe, it } from 'node:test';

import chai from 'chai';

import JSONSchemaTree from '../../../codegen/json-schema-tree.mjs';
import SourceDocument from '../../../core/source-document.mjs';
import StandaloneJSONSchemaObject from '../standalone-schema-object.mjs';

const { expect } = chai;

function print(document) {
  return String(
    new StandaloneJSONSchemaObject(
      new SourceDocument(document, null),
      new JSONSchemaTree(),
      'Model',
    ),
  );
}

describe('ArrayObject generator', () => {
  it('empty tuple using array-ish items', () => {
    const document = {
      items: [],
      type: 'array',
    };

    expect(print(document)).to.eq(`type Model = [];`);
  });

  it('empty tuple using maxItems', () => {
    const document = {
      items: {
        type: 'number',
      },
      maxItems: 0,
      type: 'array',
    };

    expect(print(document)).to.eq(`type Model = [];`);
  });

  it('tuple using array-ish items', () => {
    const document = {
      items: [
        {
          type: 'number',
        },
        {
          type: 'string',
        },
      ],
      type: 'array',
    };

    expect(print(document)).to.eq(`type Model = [number, string];`);
  });

  it('tuple using minItems & maxItems', () => {
    const document = {
      items: {
        additionalProperties: false,
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        title: 'User',
        type: 'object',
      },
      maxItems: 3,
      minItems: 3,
      type: 'array',
    };

    expect(print(document)).to.eq(`type _Model = {
  id: string;
};
type Model = [_Model, _Model, _Model];`);
  });

  it('minItems', () => {
    const document = {
      items: {
        type: 'number',
      },
      minItems: 3,
      type: 'array',
    };

    expect(print(document)).to.eq(
      `type Model = [number, number, number, ...number[]];`,
    );
  });

  it('maxItems', () => {
    const document = {
      items: {
        properties: {
          id: {
            type: 'string',
          },
        },
        type: 'object',
      },
      maxItems: 3,
      type: 'array',
    };

    expect(print(document)).to.eq(
      `import type * as RukCukTypeHelpers from "ruk-cuk/helpers.d.ts";
type Model = RukCukTypeHelpers.ArrayRange<{
  id?: string;
  [k: string]: unknown;
}, 0, 3>;`,
    );
  });

  it('minItems + maxItems', () => {
    const document = {
      items: {
        additionalProperties: false,
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        title: 'User',
        type: 'object',
      },
      maxItems: 5,
      minItems: 2,
      type: 'array',
    };

    expect(print(document)).to
      .eq(`import type * as RukCukTypeHelpers from "ruk-cuk/helpers.d.ts";
type Model = RukCukTypeHelpers.ArrayRange<{
  id: string;
}, 2, 5>;`);
  });

  it('invalid ranges', () => {
    const document = {
      items: {
        type: 'object',
      },
      maxItems: 2,
      minItems: 3,
      type: 'array',
    };

    expect(print(document)).to.eq(`type Model = never;`);
  });
});
