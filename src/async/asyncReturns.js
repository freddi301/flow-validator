// @flow
/* eslint-disable no-redeclare */

import { AsyncType } from "./AsyncType";
import { AsyncVType } from "./AsyncVType";

declare function asyncReturns<P, P2, P3, P4, P5, P6, R>(
  t: AsyncType<R>
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => Promise<R> | R
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => Promise<R>;
declare function asyncReturns<P, P2, P3, P4, P5, R>(
  t: AsyncType<R>
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => Promise<R>;
declare function asyncReturns<P, P2, P3, P4, R>(
  t: AsyncType<R>
): (
  f: (p: P, p2: P2, p3: P3, p4: P4) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4) => Promise<R>;
declare function asyncReturns<P, P2, P3, R>(
  t: AsyncType<R>
): (
  f: (p: P, p2: P2, p3: P3) => Promise<R>
) => (p: P, p2: P2, p3: P3) => Promise<R>;
declare function asyncReturns<P, P2, R>(
  t: AsyncType<R>
): (f: (p: P, p2: P2) => Promise<R>) => (p: P, p2: P2) => Promise<R>;
declare function asyncReturns<P, R>(
  t: AsyncType<R>
): (f: (p: P) => Promise<R>) => (p: P) => Promise<R>;

export function asyncReturns<R>(
  t: AsyncType<R>
): (f: (...p: Array<any>) => Promise<R>) => (...p: Array<any>) => Promise<R> {
  return f =>
    async function(...args) {
      const ret = f.apply(this, args);
      return t.parse(ret);
    };
}

declare function asyncVreturns<P, P2, P3, P4, P5, P6, R>(
  t: AsyncVType<R>
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => Promise<R>;
declare function asyncVreturns<P, P2, P3, P4, P5, R>(
  t: AsyncVType<R>
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => Promise<R>;
declare function asyncVreturns<P, P2, P3, P4, R>(
  t: AsyncVType<R>
): (
  f: (p: P, p2: P2, p3: P3, p4: P4) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4) => Promise<R>;
declare function asyncVreturns<P, P2, P3, R>(
  t: AsyncVType<R>
): (
  f: (p: P, p2: P2, p3: P3) => Promise<R>
) => (p: P, p2: P2, p3: P3) => Promise<R>;
declare function asyncVreturns<P, P2, R>(
  t: AsyncVType<R>
): (f: (p: P, p2: P2) => Promise<R>) => (p: P, p2: P2) => Promise<R>;
declare function asyncVreturns<P, R>(
  t: AsyncVType<R>
): (f: (p: P) => Promise<R>) => (p: P) => Promise<R>;

export function asyncVreturns<R>(
  t: AsyncVType<R>
): (f: (...p: Array<any>) => Promise<R>) => (...p: Array<any>) => Promise<R> {
  return f =>
    async function(...args) {
      const ret = f.apply(this, args);
      return t.validate(await ret);
    };
}
