// @flow

import { ValidationError } from "../sync/ValidationError";
import { AsyncType, AsyncUnionType } from "./AsyncType";

export function asyncUnion<A, B>(
  a: AsyncType<A>,
  b: AsyncType<B>
): AsyncUnionType<A, B> {
  const u = new AsyncUnionType(a, b, async v => {
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
