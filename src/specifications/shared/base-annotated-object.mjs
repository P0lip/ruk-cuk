import * as t from '@babel/types';

import { prepareForBlockComment } from '../../utils/strings.mjs';
import BaseObject from './base-object.mjs';

export default class BaseAnnotatedObject extends BaseObject {
  #definition;
  #tsTagsMap;

  constructor(definition, owner, tsTagsMap) {
    super(definition, owner);
    this.#definition = definition;
    this.#tsTagsMap = tsTagsMap;
  }

  static #toLine({ keyword, tag, kind }) {
    if (!(keyword in this)) return null;

    const value = this[keyword];

    switch (kind) {
      case 'boolean':
        return value === true ? `${tag}` : null;
      case 'string':
        return typeof value === 'string' && value.trim().length > 0
          ? value.trim()
          : null;
      case 'unknown':
        return `${tag} \`${JSON.stringify(value)}\``;
    }
  }

  get tsDocBlock() {
    return this.#tsTagsMap
      .map(BaseAnnotatedObject.#toLine, this.#definition)
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  attachTsDocBlock(node) {
    if (this.tsDocBlock.length === 0) {
      return node;
    }

    if (node.type !== 'Program') {
      t.addComment(node, 'leading', prepareForBlockComment(this.tsDocBlock));
    } else if (node.body.length > 0) {
      t.addComment(
        node.body[0],
        'leading',
        prepareForBlockComment(this.tsDocBlock),
      );
    }

    return node;
  }
}
