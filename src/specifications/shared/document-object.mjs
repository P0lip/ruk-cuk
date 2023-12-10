import Scope from '../../codegen/scope.mjs';

export default class DocumentObject {
  constructor(sourceDocument, resolver, tree) {
    const { definition } = sourceDocument;

    this.document = definition;
    this.tree = tree;
    this.resolver = resolver;
    this.resolver.registerDocument(sourceDocument.uri, this);
    this.cache = new Map();
    this.scope = Scope.register(this);
  }

  dispose() {
    this.cache.clear();
    Scope.unregister(this);
  }
}
