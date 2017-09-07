// @flow

export function syncFunctionToAsync<A, T>(
  f: (value: A) => T
): (value: A) => Promise<T> {
  return v => Promise.resolve(v).then(f);
}
