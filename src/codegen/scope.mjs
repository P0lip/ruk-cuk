// a simpler version of https://github.com/stoplightio/spectral/blob/develop/packages/ruleset-migrator/src/tree/scope.ts

// todo: should add more from lib
const REGISTERED_WORDS = [
  'Externals',
  'Record',
  'Required',
  'Partial',
  'Pick',
  'Exclude',
];

export default class Scope {
  #uniqueIdentifiers;
  #aliases;

  static #registry = new WeakMap();

  static register(object) {
    const scope = new Scope();
    Scope.#registry.set(object, scope);
    return scope;
  }

  static unregister(object) {
    return Scope.#registry.delete(object);
  }

  constructor() {
    this.#uniqueIdentifiers = new Set(REGISTERED_WORDS);
    this.#aliases = new WeakMap();
  }

  has(local) {
    return this.#uniqueIdentifiers.has(local);
  }

  generateUnique(name) {
    let uniqueName = name;
    let i = 1;
    while (this.has(uniqueName)) {
      uniqueName = `${name}_${i}`;
      i++;
    }

    this.#uniqueIdentifiers.add(uniqueName);

    return uniqueName;
  }

  store(object) {
    if (!this.#aliases.get(object)) {
      this.#aliases.set(object, object.name);
    }
  }

  load(object) {
    return this.#aliases.get(object);
  }
}
