import chai from 'chai';
import { describe, it } from 'mocha';

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
