// @flow

import { ValidationError } from '../sync/ValidationError';
import { AsyncVType } from './AsyncVType';
import { objectType } from '../sync/base';

export class AsyncVObjectType<S: {[key: string]: AsyncVType<any>}, T: $ObjMap<S, <F>(v: AsyncVType<F>) => F>> extends AsyncVType<T> {
  schema: S;
  constructor(schema: S, validate: (value: mixed) => Promise<T>) {
    super('object', validate);
    this.schema = schema;
  }
}

export function asyncVobject<S: {[key: string]: AsyncVType<any>}>(s: S): AsyncVObjectType<S, $ObjMap<S, <F>(v: AsyncVType<F>) => F>> {
  const os = new AsyncVObjectType(s, async (v) => {
    const o = objectType.validate(v);
    const keys = Object.keys(s);
    const errors = {};
    await Promise.all(keys.map(async (key) => {
      try { await s[key].validate(o[key]); } catch (e) { if (e instanceof ValidationError) errors[key] = e; else throw e; }
    }));
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: os, got: o, errors });
    return o;
  });
  return os;
}
