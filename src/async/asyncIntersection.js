// @flow

import { AsyncType, AsyncIntersectionType } from './AsyncType';

export function asyncIntersection<A, B>(a: AsyncType<A>, b: AsyncType<B>): AsyncIntersectionType<A, B> {
  return new AsyncIntersectionType(a, b, async (v) => {
    await a.parse(v);
    await b.parse(v); // TODO: which one to take? how to merge
    return ((v: any): A & B); // eslint-disable-line flowtype/no-weak-types
  });
}
