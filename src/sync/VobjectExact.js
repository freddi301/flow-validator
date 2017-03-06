// @flow

import { ValidationError } from './ValidationError';
import { VType, VObjectExactType } from './VType';
import { objectType, noProperty } from './base';

export function VobjectExact<S: {[key: string]: VType<any>}>(s: S): VObjectExactType<S, $Exact<$ObjMap<S, <F>(v: VType<F>) => F>>> {
  const oes = new VObjectExactType(s, v => {
    const o = objectType.validate(v);
    const keys = Object.keys(o);
    const errors = {};
    for (const key of keys) {
      if (!s.hasOwnProperty(key)) { errors[key] = new ValidationError({ expected: noProperty, got: o[key] }); }
      else try { s[key].validate(o[key]); } catch (e) { if (e instanceof ValidationError) errors[key] = e; else throw e; }
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: oes, got: o, errors });
    return (o: any);
  });
  return oes;
}
