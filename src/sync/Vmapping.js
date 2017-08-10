// @flow

import { ValidationError } from "./ValidationError";
import { VType, VMappingType } from "./VType";
import { objectType } from "./base";

export function Vmapping<K: string, V>(
  keys: VType<K>,
  values: VType<V>
): VMappingType<K, V> {
  const m = new VMappingType(keys, values, v => {
    const o = objectType.validate(v);
    const ks = Object.keys(o);
    const errors = {};
    for (const key of ks) {
      const value = o[key];
      let ke;
      let ve;
      try {
        keys.validate(key);
      } catch (e) {
        if (e instanceof ValidationError) ke = e;
        else throw e;
      }
      try {
        values.validate(value);
      } catch (e) {
        if (e instanceof ValidationError) ve = e;
        else throw e;
      }
      if (ke || ve) {
        errors[key] = { key: ke, value: ve };
      }
    }
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: m, got: v, errors });
    return ((v: any): { [key: K]: V }); // eslint-disable-line flowtype/no-weak-types
  });
  return m;
}
