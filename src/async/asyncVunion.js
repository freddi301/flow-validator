// @flow

import { ValidationError } from "../sync/ValidationError";
import { AsyncVType, AsyncVUnionType } from "./AsyncVType";

export function asyncVunion<A, B>(
  a: AsyncVType<A>,
  b: AsyncVType<B>
): AsyncVUnionType<A, B> {
  const u = new AsyncVUnionType(a, b, async v => {
    let left;
    let right;
    try {
      left = await a.parse(v);
    } catch (e) {
      if (e instanceof ValidationError);
      else throw e;
    }
    try {
      right = await b.parse(v);
    } catch (e) {
      if (e instanceof ValidationError);
      else throw e;
    }
    if (left) return left;
    if (right) return right;
    throw new ValidationError({ expected: u, got: v });
  });
  return u;
}
