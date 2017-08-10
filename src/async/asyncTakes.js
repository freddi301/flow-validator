// @flow

import { AsyncType } from "./AsyncType";
import { AsyncVType } from "./AsyncVType";
import { asyncTuple, asyncVtuple } from "./asyncTuple";

/* eslint-disable no-redeclare */

declare function asyncTakes<P, P2, P3, P4, P5, P6, R>(
  t: AsyncType<P>,
  t2: AsyncType<P2>,
  t3: AsyncType<P3>,
  t4: AsyncType<P4>,
  t5: AsyncType<P5>,
  t6: AsyncType<P6> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => Promise<R>;
declare function asyncTakes<P, P2, P3, P4, P5, R>(
  t: AsyncType<P>,
  t2: AsyncType<P2>,
  t3: AsyncType<P3>,
  t4: AsyncType<P4>,
  t5: AsyncType<P5> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => Promise<R>;
declare function asyncTakes<P, P2, P3, P4, R>(
  t: AsyncType<P>,
  t2: AsyncType<P2>,
  t3: AsyncType<P3>,
  t4: AsyncType<P4> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4) => Promise<R>;
declare function asyncTakes<P, P2, P3, R>(
  t: AsyncType<P>,
  t2: AsyncType<P2>,
  t3: AsyncType<P3> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3) => Promise<R>
) => (p: P, p2: P2, p3: P3) => Promise<R>;
declare function asyncTakes<P, P2, R>(
  t: AsyncType<P>,
  t2: AsyncType<P2>
): (f: (p: P, p2: P2) => Promise<R>) => (p: P, p2: P2) => Promise<R>; // eslint-disable-line no-redeclare
declare function asyncTakes<P, R>(
  t: AsyncType<P>
): (f: (p: P) => Promise<R>) => (p: P) => Promise<R>; // eslint-disable-line no-redeclare

// eslint-disable-next-line no-redeclare
export function asyncTakes<R>(
  ...AsyncTypes: Array<AsyncType<any>>
): (
  f: (...props: Array<any>) => Promise<R>
) => (...props: Array<any>) => Promise<R> {
  const paramsValidator = asyncTuple((AsyncTypes: any));
  return f =>
    async function(...params) {
      return f.apply(this, await paramsValidator.parse(params));
    };
}

declare function asyncVtakes<P, P2, P3, P4, P5, P6, R>(
  t: AsyncVType<P>,
  t2: AsyncVType<P2>,
  t3: AsyncVType<P3>,
  t4: AsyncVType<P4>,
  t5: AsyncVType<P5>,
  t6: AsyncVType<P6> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => Promise<R>;
declare function asyncVtakes<P, P2, P3, P4, P5, R>(
  t: AsyncVType<P>,
  t2: AsyncVType<P2>,
  t3: AsyncVType<P3>,
  t4: AsyncVType<P4>,
  t5: AsyncVType<P5> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => Promise<R>;
declare function asyncVtakes<P, P2, P3, P4, R>(
  t: AsyncVType<P>,
  t2: AsyncVType<P2>,
  t3: AsyncVType<P3>,
  t4: AsyncVType<P4> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4) => Promise<R>
) => (p: P, p2: P2, p3: P3, p4: P4) => Promise<R>;
declare function asyncVtakes<P, P2, P3, R>(
  t: AsyncVType<P>,
  t2: AsyncVType<P2>,
  t3: AsyncVType<P3> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3) => Promise<R>
) => (p: P, p2: P2, p3: P3) => Promise<R>;
declare function asyncVtakes<P, P2, R>(
  t: AsyncVType<P>,
  t2: AsyncVType<P2>
): (f: (p: P, p2: P2) => Promise<R>) => (p: P, p2: P2) => Promise<R>; // eslint-disable-line no-redeclare
declare function asyncVtakes<P, R>(
  t: AsyncVType<P>
): (f: (p: P) => Promise<R>) => (p: P) => Promise<R>; // eslint-disable-line no-redeclare

// eslint-disable-next-line no-redeclare
export function asyncVtakes<R>(
  ...AsyncTypes: Array<AsyncVType<any>>
): (
  f: (...props: Array<any>) => Promise<R>
) => (...props: Array<any>) => Promise<R> {
  const paramsValidator = asyncVtuple((AsyncTypes: any));
  return f =>
    async function(...params) {
      return f.apply(this, await paramsValidator.validate(params));
    };
}
