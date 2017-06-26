// @flow

import { ValidationError } from './ValidationError';
import { VType, InstanceOfType, ClassOfType, LiteralType } from './VType';
import { Type } from './Type';

export const empty: VType<void | null> = new VType('empty', v => {
  if (v === null || v === void 0) return v;
  throw new ValidationError({ expected: empty, got: v });
});

export const isNull: VType<null> = new VType('null', v => {
  if (v === null) return v;
  throw new ValidationError({ expected: isNull, got: v });
});

export const isUndefined: VType<void> = new VType('undefined', v => {
  if (v === void 0) return v;
  throw new ValidationError({ expected: isUndefined, got: v });
});

export const noProperty: VType<void> = new VType('noProperty', v => {
  if (v === void 0) return v;
  throw new ValidationError({ expected: isUndefined, got: v });
});

export const isMixed: VType<mixed> = new VType('mixed', v => v);

export const isAny: VType<any> = new VType('any', v => v);

export const number: VType<number> = new VType('number', v => {
  if (typeof v === 'number') return v;
  throw new ValidationError({ expected: number, got: v });
});

export const boolean: VType<boolean> = new VType('boolean', v => {
  if (typeof v === 'boolean') return v;
  throw new ValidationError({ expected: boolean, got: v });
});

export const objectType: VType<Object> = new VType('Object', v => {
  if (typeof v === 'object' && !!v && !Array.isArray(v)) return v;
  throw new ValidationError({ expected: objectType, got: v });
});

export const functionType: VType<Function> = new VType('Function', v => {
  if (typeof v === 'function') return v;
  throw new ValidationError({ expected: functionType, got: v });
});

export function instanceOf<T>(c: Class<T>): InstanceOfType<T> {
  const iof = new InstanceOfType(c, v => {
    if (v instanceof c) return v;
    throw new ValidationError({ expected: iof, got: v });
  });
  return iof;
}

export function classOf<T>(c: Class<T>): ClassOfType<Class<T>> {
  const cof = new ClassOfType(c, v => {
    const f = functionType.validate(v);
    if (f === c || f.prototype instanceof c) return f;
    throw new ValidationError({ expected: cof, got: v });
  });
  return cof;
}

type LiteralTypeValue = string | number | boolean;
export function literal<T: LiteralTypeValue>(value: T): LiteralType<T> {
  const lt = new LiteralType(value, v => {
    if (value === v) return ((v: any): T); // eslint-disable-line flowtype/no-weak-types
    throw new ValidationError({ expected: lt, got: v });
  });
  return lt;
}

export const truthy: Type<true> = new Type('truthy', v => {
  if (Boolean(v) === true) return true;
  throw new ValidationError({ expected: truthy, got: v });
});

export const falsy: Type<false> = new Type('falsy', v => {
  if (Boolean(v) === false) return true;
  throw new ValidationError({ expected: truthy, got: v });
});
