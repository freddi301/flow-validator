// @flow

import { ValidationError } from "../sync/ValidationError";
import { AsyncType } from "./AsyncType";
import { objectType, noProperty } from "../sync/base";

export class AsyncObjectExactType<
  S: { [key: string]: AsyncType<any> },
  T: $ObjMap<S, <F>(v: AsyncType<F>) => F>
> extends AsyncType<T> {
  schema: S;
  constructor(schema: S, parse: (value: mixed) => Promise<T>) {
    super("objectExact", parse);
    this.schema = schema;
  }
}

export function asyncObjectExact<S: { [key: string]: AsyncType<any> }>(
  s: S
): AsyncObjectExactType<S, $Exact<$ObjMap<S, <F>(v: AsyncType<F>) => F>>> {
  const oes = new AsyncObjectExactType(s, async v => {
    const o = objectType.validate(await v);
    const keys = Object.keys(o);
    const result: $Exact<$ObjMap<S, <F>(v: AsyncType<F>) => F>> = ({}: any);
    const errors = {};
    await Promise.all(
      keys.map(async key => {
        if (!s.hasOwnProperty(key)) {
          errors[key] = new ValidationError({
            expected: noProperty,
            got: o[key]
          });
        } else
          try {
            result[key] = await s[key].parse(o[key]);
          } catch (e) {
            if (e instanceof ValidationError) errors[key] = e;
            else throw e;
          }
      })
    );
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: oes, got: await o, errors });
    return result;
  });
  return oes;
}
