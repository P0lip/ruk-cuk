import chai from 'chai';
import { describe, it } from 'mocha';

import { MapWithUpsert } from '../../../utils/objects.mjs';
import parseTypescript from '../parse-typescript.mjs';
import printTree from '../print-tree.mjs';
import rewriteTree from '../rewrite-tree.mjs';

const { expect } = chai;

describe('rewriteTree codegen util', () => {
  it('should convert interfaces to types', () => {
    const tree = parseTypescript(`interface Foo {
 bar: number;
 baz: {
  abc: Foo;
 }
}`);

    rewriteTree(tree, new MapWithUpsert());

    expect(printTree(tree)).to.eq(`type Foo = {
  bar: number;
  baz: {
    abc: Foo;
  };
};`);
  });

  describe('identifiers reuse', () => {
    it('plain identifier', () => {});

    it('should make it easy to update identifiers', () => {
      const tree = parseTypescript(`interface Foo {
 bar: Bar;
 baz: {
  abc: Foo[] & Bar[];
 }
}

interface Bar {}
`);

      const ids = new MapWithUpsert();
      rewriteTree(tree, ids);
      for (const id of ids.values()) {
        id.name = `${id.name}Ha`;
      }

      expect(printTree(tree)).to.eq(`type FooHa = {
  bar: BarHa;
  baz: {
    abc: FooHa[] & BarHa[];
  };
};
type BarHa = {};`);
    });

    it('should make it easy to update identifiers #2', () => {
      const tree = parseTypescript(`type Products = [
  Product_1 & {},
  ...(Product_2 & {})[]
];
type Product_1 = {
  id: number;
  description: string | null;
  [k: string]: unknown;
};
type Product_2 = {
  id: number;
};
`);

      const ids = new MapWithUpsert();
      rewriteTree(tree, ids);
      for (const id of ids.values()) {
        id.name = `${id.name}Ha`;
      }

      expect(printTree(tree)).to
        .eq(`type ProductsHa = [Product_1Ha & {}, ...(Product_2Ha & {})[]];
type Product_1Ha = {
  id: number;
  description: string | null;
  [k: string]: unknown;
};
type Product_2Ha = {
  id: number;
};`);
    });
  });
});
