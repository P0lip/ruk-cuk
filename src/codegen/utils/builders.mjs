import * as t from '@babel/types';

export function annotatedIdentifier(name, typeAnnotation) {
  const identifier = t.identifier(name);
  identifier.typeAnnotation = typeAnnotation;
  return identifier;
}
