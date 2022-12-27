declare namespace RukCukTypeHelpers {
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
}
