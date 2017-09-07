// @flow

import { ValidationError } from "../sync/ValidationError";
import type { Errors } from "../sync/ValidationError";
import { AsyncType } from "./AsyncType";
import { AsyncVType } from "./AsyncVType";
import { arrayType } from "../sync/arrayType";

/* eslint-disable no-redeclare */

export class AsyncTupleType<T> extends AsyncType<T> {
  schema: Array<AsyncType<any>>;
  constructor(
    schema: Array<AsyncType<any>>,
    parse: (value: mixed) => Promise<T>
  ) {
    super("tuple", parse);
    this.schema = schema;
  }
}

declare function asyncTuple<A, B, C, D, E, F>(
  types: [
    AsyncType<A>,
    AsyncType<B>,
    AsyncType<C>,
    AsyncType<D>,
    AsyncType<E>,
    AsyncType<F>
  ]
): AsyncTupleType<[A, B, C, D, E, F]>; // eslint-disable-line no-redeclare
declare function asyncTuple<A, B, C, D, E>(
  types: [AsyncType<A>, AsyncType<B>, AsyncType<C>, AsyncType<D>, AsyncType<E>]
): AsyncTupleType<[A, B, C, D, E]>; // eslint-disable-line no-redeclare
declare function asyncTuple<A, B, C, D>(
  types: [AsyncType<A>, AsyncType<B>, AsyncType<C>, AsyncType<D>]
): AsyncTupleType<[A, B, C, D]>; // eslint-disable-line no-redeclare
declare function asyncTuple<A, B, C>(
  types: [AsyncType<A>, AsyncType<B>, AsyncType<C>]
): AsyncTupleType<[A, B, C]>; // eslint-disable-line no-redeclare
declare function asyncTuple<A, B>(
  types: [AsyncType<A>, AsyncType<B>]
): AsyncTupleType<[A, B]>; // eslint-disable-line no-redeclare
declare function asyncTuple<A>(types: [AsyncType<A>]): AsyncTupleType<[A]>; // eslint-disable-line no-redeclare

export function asyncTuple<S: Array<AsyncType<any>>>(
  s: S
): AsyncTupleType<$TupleMap<S, <T>(v: AsyncType<T>) => T>> {
  // eslint-disable-line no-redeclare
  const tt = new AsyncTupleType(s, async v => {
    const a = arrayType.validate(await v);
    const errors: Errors = {};
    const result = await Promise.all(
      s.map(async (t, i) => {
        try {
          return await t.parse(a[i]);
        } catch (e) {
          if (e instanceof ValidationError) {
            errors[String(i)] = (e: ValidationError);
            return (void 0: any);
          } else throw e;
        }
      })
    );
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: tt, got: await a, errors });
    return result;
  });
  return tt;
}

export class AsyncVTupleType<T> extends AsyncVType<T> {
  schema: Array<AsyncVType<any>>;
  constructor(
    schema: Array<AsyncVType<any>>,
    parse: (value: mixed) => Promise<T>
  ) {
    super("tuple", parse);
    this.schema = schema;
  }
}

declare function asyncVtuple<A, B, C, D, E, F>(
  types: [
    AsyncVType<A>,
    AsyncVType<B>,
    AsyncVType<C>,
    AsyncVType<D>,
    AsyncVType<E>,
    AsyncVType<F>
  ]
): AsyncVTupleType<[A, B, C, D, E, F]>; // eslint-disable-line no-redeclare
declare function asyncVtuple<A, B, C, D, E>(
  types: [
    AsyncVType<A>,
    AsyncVType<B>,
    AsyncVType<C>,
    AsyncVType<D>,
    AsyncVType<E>
  ]
): AsyncVTupleType<[A, B, C, D, E]>; // eslint-disable-line no-redeclare
declare function asyncVtuple<A, B, C, D>(
  types: [AsyncVType<A>, AsyncVType<B>, AsyncVType<C>, AsyncVType<D>]
): AsyncVTupleType<[A, B, C, D]>; // eslint-disable-line no-redeclare
declare function asyncVtuple<A, B, C>(
  types: [AsyncVType<A>, AsyncVType<B>, AsyncVType<C>]
): AsyncVTupleType<[A, B, C]>; // eslint-disable-line no-redeclare
declare function asyncVtuple<A, B>(
  types: [AsyncVType<A>, AsyncVType<B>]
): AsyncVTupleType<[A, B]>; // eslint-disable-line no-redeclare
declare function asyncVtuple<A>(types: [AsyncVType<A>]): AsyncVTupleType<[A]>; // eslint-disable-line no-redeclare

export function asyncVtuple<S: Array<AsyncVType<any>>>(
  s: S
): AsyncVTupleType<$TupleMap<S, <T>(v: AsyncType<T>) => T>> {
  // eslint-disable-line no-redeclare
  const tt = new AsyncVTupleType(s, async v => {
    const a = arrayType.validate(await v);
    const errors: Errors = {};
    await Promise.all(
      s.map((t, i) => {
        try {
          t.validate(a[i]);
        } catch (e) {
          if (e instanceof ValidationError)
            errors[String(i)] = (e: ValidationError);
          else throw e;
        }
      })
    );
    if (Object.getOwnPropertyNames(errors).length)
      throw new ValidationError({ expected: tt, got: await a, errors });
    return (a: any); // eslint-disable-line flowtype/no-weak-types
  });
  return tt;
}
