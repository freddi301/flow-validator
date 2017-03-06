// @flow

import { ValidationError } from './ValidationError';
import { VType } from './VType';

export const arrayType: VType<Array<mixed>> = new VType('Array', v => {
  if (typeof v === 'object' && v instanceof Array) return v;
  throw new ValidationError({ expected: arrayType, got: v });
});
