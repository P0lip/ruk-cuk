import { describe, it } from 'node:test';

import generate from '@babel/generator';
import chai from 'chai';

import _merge from '../merge.mjs';

const { expect } = chai;

import * as parser from '@babel/parser';

function parse(input) {
  return parser.parse(input, {
    plugins: ['typescript'],
    sourceType: 'module',
  }).program.body[0];
}

function print(tree) {
  return generate.default(tree).code;
}

function merge(input) {
  return print(_merge(parse(`type X = ${input}`).typeAnnotation));
}

describe('mergeObjects util', () => {
  it('merges type literals', () => {
    expect(
      merge(`{ id?: number; } & { street?: string; "zip-code"?: string };`),
    ).to.eq(
      `{
  id?: number;
  street?: string;
  "zip-code"?: string;
}`,
    );
  });

  it('merges type literals retaining their required state', () => {
    expect(
      merge(`{ id?: number; size: number } & { id: number; size?: number }`),
    ).to.eq(
      `{
  id: number;
  size: number;
}`,
    );
  });

  it('merges sibling type literals containing equal property signatures', () => {
    expect(
      merge(
        `{ street?: string; "zip-code"?: string } & { street?: string; "zip-code"?: string };`,
      ),
    ).to.eq(
      `{
  street?: string;
  "zip-code"?: string;
}`,
    );
  });

  it('refuses to merge sibling type literals containing duplicate keys with different signatures', () => {
    expect(
      merge(
        `{ street?: string; "zip-code"?: string } & { street?: { id: string } }`,
      ),
    ).to.eq(
      `{
  street?: string;
  "zip-code"?: string;
} & {
  street?: {
    id: string;
  };
}`,
    );
  });

  it('merges even if in between of other types', () => {
    expect(merge(`{ id: string } & ExtendableAddress & { id: string }`)).to.eq(
      `{
  id: string;
} & ExtendableAddress`,
    );
  });

  it('equal tuples', () => {
    expect(
      merge(
        `{ id?: [string, string]; } & { id?: [key: string, value: string] }`,
      ),
    ).to.eq(
      `{
  id?: [string, string];
}`,
    );
  });

  it('indices', () => {
    expect(
      merge(
        `{ value: string; [k: string]: unknown } & { [k: string]: unknown }`,
      ),
    ).to.eq(
      `{
  value: string;
  [k: string]: unknown;
}`,
    );
  });

  it('equal type references', () => {
    expect(
      merge(
        `{ id: RukCukTypeHelpers.PathParams<string> } & { id: RukCukTypeHelpers.PathParams<string> }`,
      ),
    ).to.eq(`{
  id: RukCukTypeHelpers.PathParams<string>;
}`);

    expect(merge(`{ id: Test<string, number> } & { id: Test<string, number> }`))
      .to.eq(`{
  id: Test<string, number>;
}`);

    expect(
      merge(
        `{ id: RukCukTypeHelpers.QueryParam } & { id: RukCukTypeHelpers.QueryParam }`,
      ),
    ).to.eq(`{
  id: RukCukTypeHelpers.QueryParam;
}`);
  });

  it('refuses to merge different type references', () => {
    expect(
      merge(
        `{ id: RukCukTypeHelpers.CookieParam<string> } & { id: RukCukTypeHelpers.CookieParam }`,
      ),
    ).to.eq(`{
  id: RukCukTypeHelpers.CookieParam<string>;
} & {
  id: RukCukTypeHelpers.CookieParam;
}`);

    expect(
      merge(
        `{ id: RukCukTypeHelpers.CookieParam<string> } & { id: RukCukTypeHelpers.CookieParam<string, string>}`,
      ),
    ).to.eq(`{
  id: RukCukTypeHelpers.CookieParam<string>;
} & {
  id: RukCukTypeHelpers.CookieParam<string, string>;
}`);

    expect(
      merge(
        `{ id: RukCukTypeHelpers.PathParam<string, number> } & { id: RukCukTypeHelpers.PathParam<number, string> }`,
      ),
    ).to.eq(`{
  id: RukCukTypeHelpers.PathParam<string, number>;
} & {
  id: RukCukTypeHelpers.PathParam<number, string>;
}`);
  });
});
