// @flow

import { ValidationError } from './ValidationError';
import { Type } from './Type';

export function unionFromObjectKeys<O: Object>(o: O): Type<$Keys<O>> {
  const en = new Type('enum', v => {
    const keys = Object.keys(o);
    if (~keys.indexOf(v)) return ((v: any): $Keys<O>);  // eslint-disable-line flowtype/no-weak-types
    throw new ValidationError({ expected: en, got: v });
  });
  return en;
}
