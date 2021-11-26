import * as t from '@babel/types';

function annotatedIdentifier(name, typeAnnotation) {
  const identifier = t.identifier(name);
  identifier.typeAnnotation = typeAnnotation;
  return identifier;
}

export default function generateOperationObject(operationObject) {
  return t.tsPropertySignature(
    t.identifier(operationObject.name),
    t.tsTypeAnnotation(
      t.tsFunctionType(
        null,
        operationObject.parameters.size === 0
          ? []
          : [
              annotatedIdentifier(
                'params',
                t.tsTypeAnnotation(
                  t.tsTypeReference(
                    t.identifier(operationObject.parameters.name),
                  ),
                ),
              ),
            ],
        t.tsTypeAnnotation(
          t.tsTypeReference(
            t.identifier('Promise'),
            t.tsTypeParameterInstantiation([
              operationObject.responses.size === 0
                ? t.tsVoidKeyword()
                : t.tsTypeReference(
                    t.identifier(operationObject.responses.name),
                  ),
            ]),
          ),
        ),
      ),
    ),
  );
}
