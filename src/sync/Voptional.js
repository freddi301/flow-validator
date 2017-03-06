// @flow

import { VType, VOptionalType } from './VType';

export function Voptional<T>(t: VType<T>): VOptionalType<T> {
  return new VOptionalType(t, v => {
    if ((v === null) || (v === void 0)) return v;
    return t.validate(v);
  });
}
