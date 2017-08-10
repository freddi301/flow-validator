// @flow

import { ValidationError } from "./ValidationError";
import type { Errors } from "./ValidationError";
import { arrayType } from "./arrayType";
import { Type, ArrayOfType } from "./Type";

export function arrayOf<T>(t: Type<T>): ArrayOfType<T> {
  const aof = new ArrayOfType(t, v => {
    const a = arrayType.validate(v);
    const result: Array<T> = [];
    const errors: Errors = {};
    a.forEach((item, index) => {
      try {
        result[index] = t.parse(item);
      } catch (e) {
        if (e instanceof ValidationError)
          errors[String(index)] = (e: ValidationError);
        else throw e;
      }
    });
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: aof, got: v, errors });
    return result;
  });
  return aof;
}
