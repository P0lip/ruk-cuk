import { isLocalRef } from '@stoplight/json';

export default function isExternalJsonRef(ref) {
  return !isLocalRef(ref);
}
