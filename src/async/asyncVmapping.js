// @flow

import { ValidationError } from "../sync/ValidationError";
import { AsyncVType } from "./AsyncVType";
import { objectType } from "../sync/base";

export class AsyncVMappingType<K, V> extends AsyncVType<{ [key: K]: V }> {
  keys: AsyncVType<K>;
  values: AsyncVType<V>;
  constructor(
    keys: AsyncVType<K>,
    values: AsyncVType<V>,
    validate: (value: mixed) => Promise<{ [key: K]: V }>
  ) {
    super("mapping", validate);
    this.keys = keys;
    this.values = values;
  }
}

export function asyncVmapping<K: string, V>(
  keys: AsyncVType<K>,
  values: AsyncVType<V>
): AsyncVMappingType<K, V> {
  const m = new AsyncVMappingType(keys, values, async v => {
    const o = objectType.validate(v);
    const ks = Object.keys(o);
    const errors = {};
    await Promise.all(
      ks.map(async key => {
        const value = o[key];
        let ke;
        let ve;
        try {
          await keys.validate(key);
        } catch (e) {
          if (e instanceof ValidationError) ke = e;
          else throw e;
        }
        try {
          await values.validate(value);
        } catch (e) {
          if (e instanceof ValidationError) ve = e;
          else throw e;
        }
        if (ke || ve) {
          errors[key] = { key: ke, value: ve };
        }
      })
    );
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: m, got: v, errors });
    return ((v: any): { [key: K]: V }); // eslint-disable-line flowtype/no-weak-types
  });
  return m;
}
