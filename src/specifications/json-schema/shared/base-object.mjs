import BaseAnnotatedObject from '../../shared/base-annotated-object.mjs';

const TS_TAGS_MAP = [
  {
    keyword: 'description',
    kind: 'string',
    tag: '',
  },
  {
    keyword: 'deprecated',
    kind: 'boolean',
    tag: '@deprecated',
  },
  {
    keyword: 'x-internal',
    kind: 'boolean',
    tag: '@internal',
  },
  {
    keyword: 'default',
    kind: 'unknown',
    tag: '@defaultValue',
  },
];

export default class BaseSchemaObject extends BaseAnnotatedObject {
  #definition;

  constructor(definition, owner) {
    super(definition, owner, TS_TAGS_MAP);

    this.#definition = definition;
    this.context = owner.context;
  }
}
