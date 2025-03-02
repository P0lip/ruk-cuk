import * as t from '@babel/types';

function getHelper(name) {
  return t.tsQualifiedName(
    t.identifier('RukCukTypeHelpers'),
    t.identifier(name),
  );
}

export const HELPERS_IMPORT = t.importDeclaration(
  [t.importNamespaceSpecifier(t.identifier('RukCukTypeHelpers'))],
  t.stringLiteral('ruk-cuk/helpers.d.ts'),
);
HELPERS_IMPORT.importKind = 'type';

export const ARRAY_RANGE_HELPER = getHelper('ArrayRange');

export const REQUEST_BODY_HELPER = getHelper('RequestBody');
export const PATH_PARAM_HELPER = getHelper('PathParam');
export const QUERY_PARAM_HELPER = getHelper('QueryParam');
export const HEADER_PARAM_HELPER = getHelper('HeaderParam');
export const COOKIE_PARAM_HELPER = getHelper('CookieParam');
