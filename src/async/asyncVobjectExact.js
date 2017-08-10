// @flow

import { ValidationError } from "../sync/ValidationError";
import { AsyncVType } from "./AsyncVType";
import { objectType, noProperty } from "../sync/base";

export class AsyncVObjectExactType<
  S: { [key: string]: AsyncVType<any> },
  T: $ObjMap<S, <F>(v: AsyncVType<F>) => F>
> extends AsyncVType<T> {
  schema: S;
  constructor(schema: S, validate: (value: mixed) => Promise<T>) {
    super("objectExact", validate);
    this.schema = schema;
  }
}

export function asyncVobjectExact<S: { [key: string]: AsyncVType<any> }>(
  s: S
): AsyncVObjectExactType<S, $Exact<$ObjMap<S, <F>(v: AsyncVType<F>) => F>>> {
  const oes = new AsyncVObjectExactType(s, async v => {
    const o = objectType.validate(await v);
    const keys = Object.keys(o);
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
            await s[key].validate(o[key]);
          } catch (e) {
            if (e instanceof ValidationError) errors[key] = e;
            else throw e;
          }
      })
    );
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: oes, got: o, errors });
    return (o: any);
  });
  return oes;
}
