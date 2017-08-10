// @flow

import { ValidationError } from "../sync/ValidationError";
import { AsyncType } from "./AsyncType";
import { objectType } from "../sync/base";

export class AsyncObjectType<
  S: { [key: string]: AsyncType<any> },
  T: $ObjMap<S, <F>(v: AsyncType<F>) => F>
> extends AsyncType<T> {
  schema: S;
  constructor(schema: S, parse: (value: mixed) => Promise<T>) {
    super("object", parse);
    this.schema = schema;
  }
}

export function asyncObject<S: { [key: string]: AsyncType<any> }>(
  s: S
): AsyncObjectType<S, $ObjMap<S, <F>(v: AsyncType<F>) => F>> {
  const os = new AsyncObjectType(s, async v => {
    const o = objectType.validate(await v);
    const keys = Object.keys(s);
    const result = {};
    const errors = {};
    await Promise.all(
      keys.map(async key => {
        try {
          result[key] = await s[key].parse(o[key]);
        } catch (e) {
          if (e instanceof ValidationError) errors[key] = e;
          else throw e;
        }
      })
    );
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: os, got: o, errors });
    return result;
  });
  return os;
}
