// @flow

import { ValidationError } from '../sync/ValidationError';
import type { Errors } from '../sync/ValidationError';
import { arrayType } from '../sync/arrayType';
import { AsyncType } from './AsyncType';

export class AsyncArrayOfType<T> extends AsyncType<Array<T>> {
  innerType: AsyncType<T>;
  constructor(t: AsyncType<T>, parse: (value: mixed) => Array<T> | Promise<Array<T>>) {
    super('arrayOf', parse);
    this.innerType = t;
  }
}

export function asyncArrayOf<T>(t: AsyncType<T>): AsyncArrayOfType<T> {
  const aof = new AsyncArrayOfType(t, async (v) => {
    const a = arrayType.validate(v);
    const errors: Errors = {};
    const result: Array<T> = await Promise.all(a.map(async (item, index) => {
      try { return await t.parse(item); } catch (e) {
        if (e instanceof ValidationError) {
          errors[String(index)] = (e: ValidationError);
          return ((void 0): any);
        } else throw e;
      }
    }));
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: aof, got: v, errors });
    return result;
  });
  return aof;
}
