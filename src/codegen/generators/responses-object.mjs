import mergeObjects from './utils/merge-objects.mjs';

export default function generateResponsesObject(responsesObject) {
  return mergeObjects(
    Array.from(responsesObject),
    'tsUnionType',
    responsesObject.name,
  );
}
