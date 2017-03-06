// @flow

import { Type, ComposeLeftType } from './Type';

export function composeLeft<T1, T2>(a: Type<T1>, b: (v: T1) => T2): ComposeLeftType<T1, T2> { // a,b -> b(a())
  return new ComposeLeftType(a, b);
}
