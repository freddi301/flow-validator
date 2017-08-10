// @flow

import { Type } from "./Type";
import { VType } from "./VType";
import { tuple, Vtuple } from "./tuple";

/* eslint-disable no-redeclare */

declare function takes<P, P2, P3, P4, P5, P6, R>(
  t: Type<P>,
  t2: Type<P2>,
  t3: Type<P3>,
  t4: Type<P4>,
  t5: Type<P5>,
  t6: Type<P6> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R;
declare function takes<P, P2, P3, P4, P5, R>(
  t: Type<P>,
  t2: Type<P2>,
  t3: Type<P3>,
  t4: Type<P4>,
  t5: Type<P5> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => R
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => R;
declare function takes<P, P2, P3, P4, R>(
  t: Type<P>,
  t2: Type<P2>,
  t3: Type<P3>,
  t4: Type<P4> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4) => R
) => (p: P, p2: P2, p3: P3, p4: P4) => R;
declare function takes<P, P2, P3, R>(
  t: Type<P>,
  t2: Type<P2>,
  t3: Type<P3> // eslint-disable-line no-redeclare
): (f: (p: P, p2: P2, p3: P3) => R) => (p: P, p2: P2, p3: P3) => R;
declare function takes<P, P2, R>(
  t: Type<P>,
  t2: Type<P2>
): (f: (p: P, p2: P2) => R) => (p: P, p2: P2) => R; // eslint-disable-line no-redeclare
declare function takes<P, R>(t: Type<P>): (f: (p: P) => R) => (p: P) => R; // eslint-disable-line no-redeclare

// eslint-disable-next-line no-redeclare
export function takes<R>(
  ...types: Array<Type<any>>
): (f: (...props: Array<any>) => R) => (...props: Array<any>) => R {
  const paramsValidator = tuple((types: any));
  return f =>
    function(...params) {
      return f.apply(this, paramsValidator.parse(params));
    };
}

declare function Vtakes<P, P2, P3, P4, P5, P6, R>(
  t: VType<P>,
  t2: VType<P2>,
  t3: VType<P3>,
  t4: VType<P4>,
  t5: VType<P5>,
  t6: VType<P6> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R;

declare function Vtakes<P, P2, P3, P4, P5, R>(
  t: VType<P>,
  t2: VType<P2>,
  t3: VType<P3>,
  t4: VType<P4>,
  t5: VType<P5> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => R
) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => R;
declare function Vtakes<P, P2, P3, P4, R>(
  t: VType<P>,
  t2: VType<P2>,
  t3: VType<P3>,
  t4: VType<P4> // eslint-disable-line no-redeclare
): (
  f: (p: P, p2: P2, p3: P3, p4: P4) => R
) => (p: P, p2: P2, p3: P3, p4: P4) => R;
declare function Vtakes<P, P2, P3, R>(
  t: VType<P>,
  t2: VType<P2>,
  t3: VType<P3> // eslint-disable-line no-redeclare
): (f: (p: P, p2: P2, p3: P3) => R) => (p: P, p2: P2, p3: P3) => R;
declare function Vtakes<P, P2, R>(
  t: VType<P>,
  t2: VType<P2>
): (f: (p: P, p2: P2) => R) => (p: P, p2: P2) => R; // eslint-disable-line no-redeclare
declare function Vtakes<P, R>(t: VType<P>): (f: (p: P) => R) => (p: P) => R; // eslint-disable-line no-redeclare

// eslint-disable-next-line no-redeclare
export function Vtakes<R>(
  ...types: Array<VType<any>>
): (f: (...props: Array<any>) => R) => (...props: Array<any>) => R {
  const paramsValidator = Vtuple((types: any));
  return f =>
    function(...params) {
      return f.apply(this, paramsValidator.validate(params));
    };
}
