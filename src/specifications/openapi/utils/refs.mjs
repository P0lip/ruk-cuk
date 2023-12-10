const REGEXP =
  /^#\/components\/(schemas|responses|parameters|pathItems|examples|requestBodies|headers)\/(.*)/; // everything excluding links, callbacks and securitySchemes

export function isSharedComponentRef($ref) {
  return REGEXP.test($ref);
}
