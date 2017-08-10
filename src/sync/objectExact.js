// @flow

import { ValidationError } from "./ValidationError";
import { Type, ObjectExactType } from "./Type";
import { objectType, noProperty } from "./base";

export function objectExact<S: { [key: string]: Type<any> }>(
  s: S
): ObjectExactType<S, $Exact<$ObjMap<S, <F>(v: Type<F>) => F>>> {
  const oes = new ObjectExactType(s, v => {
    const o = objectType.validate(v);
    const keys = Object.keys(o);
    const result = {};
    const errors = {};
    for (const key of keys) {
      if (!s.hasOwnProperty(key)) {
        errors[key] = new ValidationError({
          expected: noProperty,
          got: o[key]
        });
      } else
        try {
          result[key] = s[key].parse(o[key]);
        } catch (e) {
          if (e instanceof ValidationError) errors[key] = e;
          else throw e;
        }
    }
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: oes, got: o, errors });
    return (result: any);
  });
  return oes;
}
