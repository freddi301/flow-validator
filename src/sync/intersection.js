// @flow

import { Type, IntersectionType } from './Type';

export function intersection<A, B>(a: Type<A>, b: Type<B>): IntersectionType<A, B> {
  return new IntersectionType(a, b, v => {
    a.parse(v);
    b.parse(v); // TODO: which one to take? how to merge
    return ((v: any): A & B); // eslint-disable-line flowtype/no-weak-types
  });
}
