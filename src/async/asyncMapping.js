// @flow

import { ValidationError } from '../sync/ValidationError';
import { AsyncType } from './AsyncType';
import { objectType } from '../sync/base';

export class AsyncMappingType<K, V> extends AsyncType<{[key: K]: V}> {
  keys: AsyncType<K>;
  values: AsyncType<V>;
  constructor(keys: AsyncType<K>, values: AsyncType<V>, parse: (value: mixed) => Promise<{[key: K]: V}>) {
    super('mapping', parse);
    this.keys = keys;
    this.values = values;
  }
}

export function asyncMapping<K: string, V>(keys: AsyncType<K>, values: AsyncType<V>): AsyncMappingType<K, V> {
  const m = new AsyncMappingType(keys, values, async (v) => {
    const o = objectType.validate(await v);
    const ks = Object.keys(o);
    const result = {};
    const errors = {};
    await Promise.all(ks.map(async (key) => {
      const value = o[key];
      let kv; let vv; let ke; let ve;
      try { kv = await keys.parse(key); } catch (e) { if (e instanceof ValidationError) ke = e; else throw e; }
      try { vv = await values.parse(value); } catch (e) { if (e instanceof ValidationError) ve = e; else throw e; }
      if (ke || ve) { errors[key] = { key: ke, value: ve }; }
      else if (kv) result[kv] = vv;
    }));
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: m, got: v, errors });
    return result;
  });
  return m;
}
