// https://stackoverflow.com/a/72522221
export type ArrayRange<
  T,
  Min extends number,
  Max extends number,
  A extends T[] = [],
  O extends boolean = false,
> = O extends false
  ? Min extends A['length']
    ? ArrayRange<T, Min, Max, A, true>
    : ArrayRange<T, Min, Max, [...A, T], false>
  : Max extends A['length']
  ? A
  : ArrayRange<T, Min, Max, [...A, T], false>;

export type ArrayMax<T, Max extends number> = ArrayRange<T, 0, Max>;

declare const ParameterType = 'param';

export type PathParam<T> = T & { [ParameterType]?: 'path' };
export type QueryParam<T> = T & { [ParameterType]?: 'query' };
export type HeaderParam<T> = T & { [ParameterType]?: 'header' };
export type CookieParam<T> = T & { [ParameterType]?: 'cookie' };

export type PathParams<T> = {
  [K in keyof T]: PathParam<T[K]>;
};

export type ExtractPathParams<T> = {
  [K in keyof T]: T[K] extends PathParam<infer U> ? U : never;
};

export type ExtractQueryParams<T> = {
  [K in keyof T]: T[K] extends QueryParam<infer U> ? U : never;
};

export type ExtractHeaderParams<T> = {
  [K in keyof T]: T[K] extends HeaderParam<infer U> ? U : never;
};

export type ExtractCookieParams<T> = {
  [K in keyof T]: T[K] extends CookieParam<infer U> ? U : never;
};

export type ExtractParamName<T> = {
  [K in keyof T]: T[K] extends never ? never : K;
}[keyof T];
