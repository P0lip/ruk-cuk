import mergeObjects from './utils/merge-objects.mjs';

export default function generateContentVirtualObject(responseObject) {
  return mergeObjects(
    responseObject.objects,
    'tsUnionType',
    responseObject.name,
  );
}
