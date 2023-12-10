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

describe('ObjectObject generator', () => {
  it('handles complex additionalProperties', () => {
    const document = {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: ['string', 'number'],
        },
      },
    };

    expect(print(document)).to.eq(
      `type Model = Record<string, (string | number)[]>;`,
    );
  });

  it('empty object using additionalProperties', () => {
    const object = { type: 'object', additionalProperties: false };

    expect(print(object)).to.eq(`type Model = Record<string, never>;`);
  });
});
