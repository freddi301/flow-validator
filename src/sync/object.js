// @flow

import { ValidationError } from "./ValidationError";
import { Type, ObjectType } from "./Type";
import { objectType } from "./base";

export function object<S: { [key: string]: Type<any> }>(
  s: S
): ObjectType<S, $ObjMap<S, <F>(v: Type<F>) => F>> {
  const os = new ObjectType(s, v => {
    const o = objectType.validate(v);
    const keys = Object.keys(s);
    const result = {};
    const errors = {};
    for (const key of keys) {
      try {
        result[key] = s[key].parse(o[key]);
      } catch (e) {
        if (e instanceof ValidationError) errors[key] = e;
        else throw e;
      }
    }
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: os, got: o, errors });
    return result;
  });
  return os;
}
