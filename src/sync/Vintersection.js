// @flow

import { VType, VIntersectionType } from './VType';

export function Vintersection<A, B>(a: VType<A>, b: VType<B>): VIntersectionType<A, B> {
  return new VIntersectionType(a, b, v => {
    a.validate(v);
    b.validate(v);
    return ((v: any): A & B); // eslint-disable-line flowtype/no-weak-types
  });
}
