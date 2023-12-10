import BaseJsonReferenceObject from '../../shared/json-reference-object.mjs';
import assignObject from '../schema-utils/assign-object.mjs';

export default class JsonReferenceObject extends BaseJsonReferenceObject {
  #referencedObject;

  constructor(definition, owner) {
    super(definition, owner);

    this.#referencedObject = null;

    this.resolver.resolveDocumentFragment(
      definition.$ref,
      (fragment, resolver) => {
        if (super.referencedObject === null) {
          this.resolver = resolver;
          this.#referencedObject = assignObject(fragment, this);
        }
      },
    );
  }
  build() {
    if (this.referencedObject === null && this.#referencedObject !== null) {
      return this.#referencedObject.build();
    }

    return super.build();
  }
}
