// @flow

import { Type, ComposeRightType } from "./Type";

export function composeRight<T1, T2>(
  a: (v: T1) => T2,
  b: Type<T1>
): ComposeRightType<T1, T2> {
  // a,b -> a(b())
  return new ComposeRightType(a, b);
}
