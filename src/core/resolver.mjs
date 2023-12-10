import path from 'node:path';

import {
  extractPointerFromRef,
  extractSourceFromRef,
  resolveInlineRef,
} from '@stoplight/json';

import isExternalJsonRef from '../specifications/shared/utils/is-external-json-ref.mjs';
import { dirname } from '../utils/strings.mjs';
import SourceDocument from './source-document.mjs';

export default class Resolver {
  #fs;
  #uri;
  #document;
  #store;
  #resolved;

  #pending;
  #external;
  #documents;

  constructor(
    sourceDocument,
    fs,
    external = new Map(),
    documents = new Map(),
    pending = new Set(),
  ) {
    this.#fs = fs;
    this.#uri = sourceDocument.source;
    this.#document = sourceDocument.definition;
    this.#store = new Map();
    this.#pending = pending;
    this.#documents = documents;
    this.#external = external;
    if (!this.#external.has(this.#uri)) {
      this.#external.set(this.#uri, Promise.resolve(sourceDocument));
    }
    this.#resolved = new Map();
  }

  get uri() {
    return this.#uri;
  }

  drain() {
    return Promise.all(this.#pending);
  }

  load(definition) {
    return this.#store.get(definition);
  }

  resolveExternalRef(ref) {
    return path.join(dirname(this.#uri), extractSourceFromRef(ref));
  }

  #schedule(resolvedUri) {
    let promise = this.#external.get(resolvedUri);

    if (promise === void 0) {
      promise = this.#fs
        .readFile(resolvedUri, 'utf8')
        .then(JSON.parse)
        .then(definition => {
          this.#resolved.set(resolvedUri, definition);
          return new SourceDocument(definition, resolvedUri);
        });
      this.#pending.add(promise);
      this.#external.set(resolvedUri, promise);
    }

    return promise;
  }

  fork(sourceDocument) {
    const newResolver = new Resolver(
      sourceDocument,
      this.#fs,
      this.#external,
      this.#documents,
      new Set(),
    );
    this.#pending.add(newResolver.drain());
    return newResolver;
  }

  isForeign(ref) {
    return isExternalJsonRef(ref) && this.resolveExternalRef(ref) !== this.#uri;
  }

  resolveDocumentFragment(ref, onResolve) {
    const resolvedUri = isExternalJsonRef(ref)
      ? this.resolveExternalRef(ref)
      : null;

    if (resolvedUri === null || resolvedUri === this.#uri) {
      const pointer = extractPointerFromRef(ref);
      this.#pending.add(
        onResolve(
          pointer === '#' || pointer === null
            ? this.#document
            : resolveInlineRef(this.#document, ref),
          this,
        ),
      );
      return;
    }

    const pointer = extractPointerFromRef(ref);

    this.#pending.add(
      this.#schedule(resolvedUri).then(sourceDocument =>
        onResolve(
          pointer === null
            ? sourceDocument.definition
            : resolveInlineRef(sourceDocument.definition, pointer),
          this.fork(sourceDocument),
        ),
      ),
    );
  }

  resolveInlineRef(ref) {
    if (ref === null) {
      return this.#document;
    }

    return resolveInlineRef(this.#document, ref);
  }

  resolveObject(ref) {
    const targetObject = this.load(this.resolveInlineRef(ref));

    if (targetObject === void 0) {
      throw new ReferenceError(`Could not resolve ref ${ref}.`);
    }

    return targetObject;
  }

  store(definition, object) {
    this.#store.set(definition, object);
  }

  retrieveDocument($ref) {
    const fileUri = extractSourceFromRef($ref);
    const uri = this.resolveExternalRef(fileUri);
    return this.#documents.get(uri);
  }

  registerDocument(uri, object) {
    this.#documents.set(uri, object);
  }
}
