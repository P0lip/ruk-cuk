import * as t from '@babel/types';

export default function generateReferenceObject(referenceObject) {
  return t.tsTypeReference(t.identifier(referenceObject.name));
}
