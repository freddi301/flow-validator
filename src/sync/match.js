// @flow
/* eslint-disable no-redeclare */

import { ValidationError } from "./ValidationError";
import { Type } from "./Type";

declare function match<A, AR, B, BR, C, CR, D, DR>(
  v: A,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR,
  Type<C>,
  (b: C) => CR,
  Type<D>,
  (b: D) => DR
): AR;
declare function match<A, AR, B, BR, C, CR, D, DR>(
  v: B,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR,
  Type<C>,
  (b: C) => CR,
  Type<D>,
  (b: D) => DR
): BR;
declare function match<A, AR, B, BR, C, CR, D, DR>(
  v: C,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR,
  Type<C>,
  (b: C) => CR,
  Type<D>,
  (b: D) => DR
): CR;
declare function match<A, AR, B, BR, C, CR, D, DR>(
  v: D,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR,
  Type<C>,
  (b: C) => CR,
  Type<D>,
  (b: D) => DR
): DR;
declare function match<A, AR, B, BR, C, CR, D, DR>(
  v: mixed,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR,
  Type<C>,
  (b: C) => CR,
  Type<D>,
  (b: D) => DR
): AR | BR | CR | DR;

declare function match<A, AR, B, BR, C, CR>(
  v: A,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR,
  Type<C>,
  (b: B) => CR
): AR;
declare function match<A, AR, B, BR, C, CR>(
  v: B,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR,
  Type<C>,
  (b: B) => CR
): BR;
declare function match<A, AR, B, BR, C, CR>(
  v: C,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR,
  Type<C>,
  (b: B) => CR
): CR;
declare function match<A, AR, B, BR, C, CR>(
  v: mixed,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR,
  Type<C>,
  (b: B) => CR
): AR | BR | CR;

declare function match<A, AR, B, BR>(
  v: A,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR
): AR;
declare function match<A, AR, B, BR>(
  v: B,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR
): BR;
declare function match<A, AR, B, BR>(
  v: mixed,
  Type<A>,
  (a: A) => AR,
  Type<B>,
  (b: B) => BR
): AR | BR;

declare function match<A, AR>(v: A, Type<A>, (a: A) => AR): AR;
declare function match<A, AR>(v: mixed, Type<A>, (a: A) => AR): AR;

export function match(...patterns) {
  const v: mixed = patterns[0];
  for (let i = 1; i < patterns.length; i += 2) {
    const t: Type<mixed> = patterns[i];
    const f: Function = patterns[i + 1];
    let pv;
    try {
      pv = t.parse(v);
    } catch (e) {
      if (e instanceof ValidationError) continue;
      else throw e;
    }
    return f(pv);
  }
  throw new ValidationError({
    expected: ({ name: "pattern" }: any),
    got: v,
    description: "no pattern matches"
  });
}
