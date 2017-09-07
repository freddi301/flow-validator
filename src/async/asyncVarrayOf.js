// @flow

import { ValidationError } from "../sync/ValidationError";
import type { Errors } from "../sync/ValidationError";
import { arrayType } from "../sync/arrayType";
import { AsyncVType } from "./AsyncVType";

export class AsyncVArrayOfType<T> extends AsyncVType<Array<T>> {
  innerType: AsyncVType<T>;
  constructor(t: AsyncVType<T>, validate: (value: mixed) => Promise<Array<T>>) {
    super("arrayOf", validate);
    this.innerType = t;
  }
}

export function asyncVarrayOf<T>(t: AsyncVType<T>): AsyncVArrayOfType<T> {
  const aof = new AsyncVArrayOfType(t, async v => {
    const a = arrayType.validate(v);
    const errors: Errors = {};
    await Promise.all(
      a.map(async (item, index) => {
        try {
          await t.validate(item);
        } catch (e) {
          if (e instanceof ValidationError)
            errors[String(index)] = (e: ValidationError);
          else throw e;
        }
      })
    );
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: aof, got: v, errors });
    return ((a: any): Array<T>); // eslint-disable-line flowtype/no-weak-types
  });
  return aof;
}
