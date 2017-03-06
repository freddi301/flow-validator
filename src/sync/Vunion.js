// @flow

import { ValidationError } from './ValidationError';
import { VType, VUnionType } from './VType';

export function Vunion<A, B>(a: VType<A>, b: VType<B>): VUnionType<A, B> {
  const u = new VUnionType(a, b, v => {
    let left; let right;
    try { left = a.parse(v); } catch (e) { if (e instanceof ValidationError); else throw e; }
    try { right = b.parse(v); } catch (e) { if (e instanceof ValidationError); else throw e; }
    if (left) return left;
    if (right) return right;
    throw new ValidationError({ expected: u, got: v });
  });
  return u;
}
