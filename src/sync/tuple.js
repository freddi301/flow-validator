// @flow

import { ValidationError } from './ValidationError';
import type { Errors } from './ValidationError';
import { Type, TupleType } from './Type';
import { VType, VTupleType } from './VType';
import { arrayType } from './arrayType';

declare function tuple<A, B, C, D, E, F>(types: [Type<A>, Type<B>, Type<C>, Type<E>, Type<F>]) : TupleType<[A, B, C, E]>; // eslint-disable-line no-redeclare
declare function tuple<A, B, C, D, E>(types: [Type<A>, Type<B>, Type<C>, Type<E>]) : TupleType<[A, B, C, E]>; // eslint-disable-line no-redeclare
declare function tuple<A, B, C, D>(types: [Type<A>, Type<B>, Type<C>, Type<D>]) : TupleType<[A, B, C, D]>; // eslint-disable-line no-redeclare
declare function tuple<A, B, C>(types: [Type<A>, Type<B>, Type<C>]) : TupleType<[A, B, C]>; // eslint-disable-line no-redeclare
declare function tuple<A, B>(types: [Type<A>, Type<B>]) : TupleType<[A, B]>; // eslint-disable-line no-redeclare
declare function tuple<A>(types: [Type<A>]) : TupleType<[A]>; // eslint-disable-line no-redeclare

export function tuple<S: Array<Type<any>>>(s: S): TupleType<$TupleMap<S, <T>(v: Type<T>) => T>> { // eslint-disable-line no-redeclare
  const tt = new TupleType(s, v => {
    const a = arrayType.validate(v);
    const result = [];
    const errors: Errors = {};
    for (let i = 0; i < s.length; i++) {
      try {
        result[i] = s[i].parse(a[i]);
      } catch (e) {
        if (e instanceof ValidationError) errors[String(i)] = (e: ValidationError);
        else throw e;
      }
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: tt, got: a, errors });
    return result;
  });
  return tt;
}

declare function Vtuple<A, B, C, D, E, F>(types: [VType<A>, VType<B>, VType<C>, VType<D>, VType<E>, VType<F>]) : VTupleType<[A, B, C, D, E, F]>; // eslint-disable-line no-redeclare
declare function Vtuple<A, B, C, D, E>(types: [VType<A>, VType<B>, VType<C>, VType<D>, VType<E>]) : VTupleType<[A, B, C, D, E]>; // eslint-disable-line no-redeclare
declare function Vtuple<A, B, C, D>(types: [VType<A>, VType<B>, VType<C>, VType<D>]) : VTupleType<[A, B, C, D]>; // eslint-disable-line no-redeclare
declare function Vtuple<A, B, C>(types: [VType<A>, VType<B>, VType<C>]) : VTupleType<[A, B, C]>; // eslint-disable-line no-redeclare
declare function Vtuple<A, B>(types: [VType<A>, VType<B>]) : VTupleType<[A, B]>; // eslint-disable-line no-redeclare
declare function Vtuple<A>(types: [VType<A>]) : VTupleType<[A]>; // eslint-disable-line no-redeclare

export function Vtuple<S: Array<VType<any>>>(s: S): VTupleType<$TupleMap<S, <T>(v: Type<T>) => T>> { // eslint-disable-line no-redeclare
  const tt = new VTupleType(s, v => {
    const a = arrayType.validate(v);
    const errors: Errors = {};
    for (let i = 0; i < s.length; i++) {
      try {
        s[i].validate(a[i]);
      } catch (e) {
        if (e instanceof ValidationError) errors[String(i)] = (e: ValidationError);
        else throw e;
      }
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: tt, got: a, errors });
    return a;
  });
  return tt;
}
