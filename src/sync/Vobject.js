// @flow

import { ValidationError } from './ValidationError';
import { VType, VObjectType } from './VType';
import { objectType } from './base';

export function Vobject<S: {[key: string]: VType<any>}>(s: S): VObjectType<S, $ObjMap<S, <F>(v: VType<F>) => F>> {
  const os = new VObjectType(s, v => {
    const o = objectType.validate(v);
    const keys = Object.keys(s);
    const errors = {};
    for (const key of keys) {
      try { s[key].validate(o[key]); } catch (e) { if (e instanceof ValidationError) errors[key] = e; else throw e; }
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: os, got: o, errors });
    return o;
  });
  return os;
}
