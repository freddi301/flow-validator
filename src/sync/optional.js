// @flow

import { Type, OptionalType } from "./Type";

export function optional<T>(t: Type<T>): OptionalType<T> {
  return new OptionalType(t, v => {
    if (v === null || v === void 0) return v;
    return t.parse(v);
  });
}
