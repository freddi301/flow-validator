// @flow

import { AsyncVType, AsyncVOptionalType } from './AsyncVType';

export function asyncVoptional<T>(t: AsyncVType<T>): AsyncVOptionalType<T> {
  return new AsyncVOptionalType(t, async (v) => {
    if ((v === null) || (v === void 0)) return v;
    return t.validate(v);
  });
}
