// @flow

export function syncFunctionToAsync<T>(
  f: (value: mixed) => T | Promise<T>
): (value: mixed) => Promise<T> {
  return v => Promise.resolve(v).then(f);
}
