// @flow

import { AsyncType, AsyncOptionalType } from "./AsyncType";

export function asyncOptional<T>(t: AsyncType<T>): AsyncOptionalType<T> {
  return new AsyncOptionalType(t, async v => {
    if (v === null || v === void 0) return v;
    return t.parse(v);
  });
}
