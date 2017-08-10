// @flow

import { AsyncVType, AsyncVIntersectionType } from "./AsyncVType";

export function asyncVintersection<A, B>(
  a: AsyncVType<A>,
  b: AsyncVType<B>
): AsyncVIntersectionType<A, B> {
  return new AsyncVIntersectionType(a, b, async v => {
    await a.validate(v);
    await b.validate(v);
    return ((v: any): A & B); // eslint-disable-line flowtype/no-weak-types
  });
}
