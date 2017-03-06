// @flow

import { ValidationError } from './ValidationError';
import { Type, MappingType } from './Type';
import { objectType } from './base';

export function mapping<K: string, V>(keys: Type<K>, values: Type<V>): MappingType<K, V> {
  const m = new MappingType(keys, values, v => {
    const o = objectType.validate(v);
    const ks = Object.keys(o);
    const result = {};
    const errors = {};
    for (const key of ks) {
      const value = o[key];
      let kv; let vv; let ke; let ve;
      try { kv = keys.parse(key); } catch (e) { if (e instanceof ValidationError) ke = e; else throw e; }
      try { vv = values.parse(value); } catch (e) { if (e instanceof ValidationError) ve = e; else throw e; }
      if (ke || ve) { errors[key] = { key: ke, value: ve }; }
      else if (kv) result[kv] = vv;
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: m, got: v, errors });
    return result;
  });
  return m;
}
