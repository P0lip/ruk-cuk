import BaseObject from '../../shared/base-object.mjs';

const TS_TAGS_MAP = Object.entries({
  '@defaultValue': 'default',
  '@deprecated': 'deprecated',
  '@internal': 'x-internal',
});

export default class BaseSchemaObject extends BaseObject {
  #definition;

  constructor(definition, owner) {
    super(definition, owner);

    this.#definition = definition;
    this.context = owner.context;
  }

  get tsDocBlock() {
    const block = [];

    if (
      'description' in this.#definition &&
      typeof this.#definition.description === 'string' &&
      this.#definition.description.length > 0
    ) {
      block.push(this.#definition.description.trim());
    }

    block.push(
      ...TS_TAGS_MAP.map(([tag, keyword]) => {
        if (!(keyword in this.#definition)) return null;

        const value = this.#definition[keyword];

        switch (keyword) {
          case 'deprecated':
          case 'x-internal':
            return value === true ? `${tag}` : null;
          default:
            return `${tag} \`${JSON.stringify(value)}\``;
        }
      }).filter(Boolean),
    );

    return block.join('\n');
  }
}
