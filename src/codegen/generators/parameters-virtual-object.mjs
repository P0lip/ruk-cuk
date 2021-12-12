import mergeObjects from './utils/merge-objects.mjs';

export default function generateParametersVirtualObject(
  parametersVirtualObject,
) {
  return mergeObjects(
    Array.from(parametersVirtualObject),
    'tsIntersectionType',
    parametersVirtualObject.name,
  );
}
