// @flow

import { ValidationError } from "./ValidationError";
import type { Errors } from "./ValidationError";
import { arrayType } from "./arrayType";
import { VType, VArrayOfType } from "./VType";

export function VarrayOf<T>(t: VType<T>): VArrayOfType<T> {
  const aof = new VArrayOfType(t, v => {
    const a = arrayType.validate(v);
    const errors: Errors = {};
    a.forEach((item, index) => {
      try {
        t.validate(item);
      } catch (e) {
        if (e instanceof ValidationError)
          errors[String(index)] = (e: ValidationError);
        else throw e;
      }
    });
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: aof, got: v, errors });
    return ((a: any): Array<T>); // eslint-disable-line flowtype/no-weak-types
  });
  return aof;
}
