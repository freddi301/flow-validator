// @flow
/* eslint-disable no-redeclare */ 

import { Type } from './Type';
import { VType } from './VType';

declare function returns<P, P2, P3, P4, P5, P6, R>(t: Type<R>):
  (f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R;
declare function returns<P, P2, P3, P4, P5, R>(t: Type<R>):
  (f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => R) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => R;
declare function returns<P, P2, P3, P4, R>(t: Type<R>):
  (f: (p: P, p2: P2, p3: P3, p4: P4) => R) => (p: P, p2: P2, p3: P3, p4: P4) => R;
declare function returns<P, P2, P3, R>(t: Type<R>):
  (f: (p: P, p2: P2, p3: P3) => R) => (p: P, p2: P2, p3: P3) => R;
declare function returns<P, P2, R>(t: Type<R>): (f: (p: P, p2: P2) => R) => (p: P, p2: P2) => R;
declare function returns<P, R>(t: Type<R>): (f: (p: P) => R) => (p: P) => R;

export function returns<R>(t: Type<R>): (f: (...p: Array<any>) => R) => (...p: Array<any>) => R {
  return f => function(...args) {
    const ret = f.apply(this, args);
    return t.parse(ret);
  };
}

declare function Vreturns<P, P2, P3, P4, P5, P6, R>(t: VType<R>):
  (f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R;
declare function Vreturns<P, P2, P3, P4, P5, R>(t: VType<R>):
  (f: (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => R) => (p: P, p2: P2, p3: P3, p4: P4, p5: P5) => R;
declare function Vreturns<P, P2, P3, P4, R>(t: VType<R>):
  (f: (p: P, p2: P2, p3: P3, p4: P4) => R) => (p: P, p2: P2, p3: P3, p4: P4) => R;
declare function Vreturns<P, P2, P3, R>(t: VType<R>):
  (f: (p: P, p2: P2, p3: P3) => R) => (p: P, p2: P2, p3: P3) => R;
declare function Vreturns<P, P2, R>(t: VType<R>): (f: (p: P, p2: P2) => R) => (p: P, p2: P2) => R;
declare function Vreturns<P, R>(t: VType<R>): (f: (p: P) => R) => (p: P) => R;

export function Vreturns<R>(t: VType<R>): (f: (...p: Array<any>) => R) => (...p: Array<any>) => R {
  return f => function(...args) {
    const ret = f.apply(this, args);
    return t.validate(ret);
  };
}
