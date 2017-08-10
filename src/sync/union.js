// @flow

import { ValidationError } from "./ValidationError";
import { Type, UnionType } from "./Type";

export function union<A, B>(a: Type<A>, b: Type<B>): UnionType<A, B> {
  const u = new UnionType(a, b, v => {
    let left;
    let right;
    try {
      left = a.parse(v);
    } catch (e) {
      if (e instanceof ValidationError);
      else throw e;
    }
    try {
      right = b.parse(v);
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
