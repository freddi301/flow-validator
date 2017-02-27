// @flow

export class Type<T> {
  name: string;
  parse: (value: mixed) => T;
  constructor(name: string, parse: (value: mixed) => T) {
    this.name = name;
    this.parse = parse;
  }
  to<T2>(f: (v: T, error: (e: any) => ValidationError) => T2): Type<T2> {
    return new Type('trasformation', v => f(this.parse(v), (err: any) => new ValidationError({ expected: err, got: v })));
  }
  refine(f: (v: T, error: (e: any) => ValidationError) => T): RefinedType<T> {
    return new RefinedType(this, v => f(this.parse(v), (err: any) => new ValidationError({ expected: err, got: v })));
  }
  and<T2>(t2: Type<T2>): IntersectionType<T, T2> { return intersection(this, t2); }
  or<T2>(t2: Type<T2>): UnionType<T, T2> { return union(this, t2); }
  optional(): OptionalType<T> { return optional(this); }
  chain<T2>(t2: Type<T2>): ChainType<T2> { return new ChainType(this, t2); }
  parseResult(v: mixed): { value?: T, error?: ValidationError } {
    try { return { value: this.parse(v) }; } catch (e) { if (e instanceof ValidationError) return { error: e }; throw e; }
  }
}

export class VType<T> extends Type<T> {
  validate: (value: mixed) => T;
  constructor(name: string, validate: (value: mixed) => T) {
    super(name, validate);
    this.validate = validate;
  }
  Vrefine(f: (v: T, error: (e: any) => ValidationError) => T): VRefinedType<T> {
    return new VRefinedType(this, v => f(this.parse(v), (err: any) => new ValidationError({ expected: err, got: v })));
  }
  isValid(v: mixed): boolean {
    try { this.validate(v); return true; } catch (e) { if (e instanceof ValidationError) return false; throw e; }
  }
  validateResult(v: mixed): { value?: T, error?: ValidationError} {
    try { return { value: this.validate(v) }; } catch (e) { if (e instanceof ValidationError) return { error: e }; throw e; }
  }
  Vand<T2>(t2: VType<T2>): VIntersectionType<T, T2> { return Vintersection(this, t2); }
  Vor<T2>(t2: VType<T2>): VUnionType<T, T2> { return Vunion(this, t2); }
  Voptional(): VOptionalType<T> { return Voptional(this); }
}

export class CustomErrorType<T> extends VType<T> {}

export class InstanceOfType<T> extends VType<T> {
  class: Class<T>;
  constructor(c: Class<T>, validate: (value: mixed) => T) { super('instanceof', validate); this.class = c; }
}

export class ClassOfType<T> extends VType<T> {
  class: T;
  constructor(c: T, validate: (value: mixed) => T) { super('classOf', validate); this.class = c; }
}

export class ArrayOfType<T> extends Type<Array<T>> {
  type: Type<T>;
  constructor(t: Type<T>, parse: (value: mixed) => Array<T>) {
    super('arrayOf', parse);
    this.type = t;
  }
}

export class VArrayOfType<T> extends VType<Array<T>> {
  type: VType<T>;
  constructor(t: VType<T>, validate: (value: mixed) => Array<T>) {
    super('arrayOf', validate);
    this.type = t;
  }
}

export class IntersectionType<A, B> extends Type<A & B> {
  typeA: Type<A>;
  typeB: Type<B>;
  constructor(a: Type<A>, b: Type<B>, parse: (value: mixed) => A & B) {
    super('intersection', parse); this.typeA = a; this.typeB = b;
  }
}

export class VIntersectionType<A, B> extends VType<A & B> {
  typeA: VType<A>;
  typeB: VType<B>;
  constructor(a: VType<A>, b: VType<B>, validate: (value: mixed) => A & B) {
    super('intersection', validate); this.typeA = a; this.typeB = b;
  }
}

export class UnionType<A, B> extends Type<A | B> {
  typeA: Type<A>;
  typeB: Type<B>;
  constructor(a: Type<A>, b: Type<B>, validate: (value: mixed) => A | B) {
    super('union', validate); this.typeA = a; this.typeB = b;
  }
}

export class VUnionType<A, B> extends VType<A | B> {
  typeA: VType<A>;
  typeB: VType<B>;
  constructor(a: VType<A>, b: VType<B>, validate: (value: mixed) => A | B) {
    super('union', validate); this.typeA = a; this.typeB = b;
  }
}

export class LiteralType<T> extends VType<T> {
  value: T;
  constructor(t: T, validate: (value: mixed) => T) { super('literal', validate); this.value = t; }
}

export class OptionalType<T> extends Type<?T> {
  type: Type<T>;
  constructor(t: Type<T>, validate: (value: mixed) => ?T) { super('optional', validate); this.type = t; }
}

export class VOptionalType<T> extends VType<?T> {
  type: VType<T>;
  constructor(t: VType<T>, validate: (value: mixed) => ?T) { super('optional', validate); this.type = t; }
}

export class MappingType<K, V> extends Type<{[key: K]: V}> {
  keys: Type<K>;
  values: Type<V>;
  constructor(keys: Type<K>, values: Type<V>, parse: (value: mixed) => {[key: K]: V}) {
    super('mapping', parse);
    this.keys = keys;
    this.values = values;
  }
}

export class VMappingType<K, V> extends VType<{[key: K]: V}> {
  keys: VType<K>;
  values: VType<V>;
  constructor(keys: VType<K>, values: VType<V>, validate: (value: mixed) => {[key: K]: V}) {
    super('mapping', validate);
    this.keys = keys;
    this.values = values;
  }
}

// export type SchemaProps = {[key: string]: Type<any>};
//export type SchemaType<P> = $ObjMap<P, <T>(v: Type<T>) => T>;

export class ObjectType<S: {[key: string]: Type<any>}, T: $ObjMap<S, <F>(v: Type<F>) => F>> extends Type<T> {
  schema: S;
  constructor(schema: S, parse: (value: mixed) => T) {
    super('object', parse);
    this.schema = schema;
  }
}

export class VObjectType<S: {[key: string]: VType<any>}, T: $ObjMap<S, <F>(v: VType<F>) => F>> extends VType<T> {
  schema: S;
  constructor(schema: S, validate: (value: mixed) => T) {
    super('object', validate);
    this.schema = schema;
  }
}

export class ObjectExactType<S: {[key: string]: Type<any>}, T: $ObjMap<S, <F>(v: Type<F>) => F>> extends Type<T> {
  schema: S;
  constructor(schema: S, parse: (value: mixed) => T) {
    super('objectExact', parse);
    this.schema = schema;
  }
}

export class VObjectExactType<S: {[key: string]: VType<any>}, T: $ObjMap<S, <F>(v: VType<F>) => F>> extends Type<T> {
  schema: S;
  constructor(schema: S, validate: (value: mixed) => T) {
    super('objectExact', validate);
    this.schema = schema;
  }
}

// export type TupleSchemaProps = Array<Type<any>>;
// export type TupleSchemaType<P> = $TupleMap<P, <T>(v: Type<T>) => T>;

export class TupleType<T> extends Type<T> {
  schema: Array<Type<any>>;
  constructor(schema: Array<Type<any>>, parse: (value: mixed) => T) {
    super('tuple', parse);
    this.schema = schema;
  }
}

export class VTupleType<T> extends VType<T> {
  schema: Array<VType<any>>;
  constructor(schema: Array<VType<any>>, validate: (value: mixed) => T) {
    super('tuple', validate);
    this.schema = schema;
  }
}

export class ChainType<T> extends Type<T> {
  left: Type<any>;
  right: Type<T>;
  constructor(left: Type<any>, right: Type<T>) {
    super('compound', v => right.parse(left.parse(v)));
    this.left = left;
    this.right = right;
  }
}

export class RefinedType<T> extends Type<T> {
  base: Type<T>;
  constructor(base: Type<T>, f: (v: mixed) => T) {
    super('refined', f);
    this.base = base;
  }
  revalidate(): Type<T> { return new Type('revalidated', v => this.base.parse(this.parse(v))); }
}

export class VRefinedType<T> extends VType<T> {
  base: VType<T>;
  constructor(base: VType<T>, f: (v: mixed) => T) {
    super('refined', f);
    this.base = base;
  }
  revalidate(): VType<T> { return new VType('revalidated', v => this.base.validate(this.validate(v))); }
}

export type Errors = {[key: string]: ValidationError };
export type ValidationErrorPayload = { expected: Type<any>, got: mixed, errors?: Errors };
export class ValidationError extends Error {
  payload: ValidationErrorPayload;
  constructor(payload: ValidationErrorPayload) { super('ValidationError'); this.payload = payload; }
  toJSON() {
    if (this.payload.errors) {
      const errors = {};
      for (const key of Object.keys(this.payload.errors)) { errors[key] = this.payload.errors[key].toJSON(); }
      return { expected: this.payload.expected, got: this.payload.got, errors };
    }
    return this.payload;
  }
}

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

export const string: VType<string> = new VType('string', v => {
  if (typeof v === 'string') return v;
  throw new ValidationError({ expected: string, got: v });
});

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

export const arrayType: VType<Array<mixed>> = new VType('Array', v => {
  if (typeof v === 'object' && v instanceof Array) return v;
  throw new ValidationError({ expected: arrayType, got: v });
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

export function arrayOf<T>(t: Type<T>): ArrayOfType<T> {
  const aof = new ArrayOfType(t, v => {
    const a = arrayType.validate(v);
    const result: Array<T> = [];
    const errors: Errors = {};
    a.forEach((item, index) => {
      try { result[index] = t.parse(item); } catch (e) {
        if (e instanceof ValidationError) errors[String(index)] = (e: ValidationError);
        else throw e;
      }
    });
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: aof, got: v, errors });
    return result;
  });
  return aof;
}

export function VarrayOf<T>(t: VType<T>): VArrayOfType<T> {
  const aof = new VArrayOfType(t, v => {
    const a = arrayType.validate(v);
    const errors: Errors = {};
    a.forEach((item, index) => {
      try { t.validate(item); } catch (e) {
        if (e instanceof ValidationError) errors[String(index)] = (e: ValidationError);
        else throw e;
      }
    });
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: aof, got: v, errors });
    return ((a: any): Array<T>); // eslint-disable-line flowtype/no-weak-types
    // return a.map(t.validate); this is type correct
  });
  return aof;
}

export function intersection<A, B>(a: Type<A>, b: Type<B>): IntersectionType<A, B> {
  return new IntersectionType(a, b, v => {
    a.parse(v);
    b.parse(v);
    return ((v: any): A & B); // eslint-disable-line flowtype/no-weak-types
  });
}

export function Vintersection<A, B>(a: VType<A>, b: VType<B>): VIntersectionType<A, B> {
  return new VIntersectionType(a, b, v => {
    a.validate(v);
    b.validate(v);
    return ((v: any): A & B); // eslint-disable-line flowtype/no-weak-types
  });
}

export function union<A, B>(a: Type<A>, b: Type<B>): UnionType<A, B> {
  const u = new UnionType(a, b, v => {
    let left; let right;
    try { left = a.parse(v); } catch (e) { if (e instanceof ValidationError); else throw e; }
    try { right = b.parse(v); } catch (e) { if (e instanceof ValidationError); else throw e; }
    if (left) return left;
    if (right) return right;
    throw new ValidationError({ expected: u, got: v });
  });
  return u;
}

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

type LiteralTypeValue = string | number | boolean;
export function literal<T: LiteralTypeValue>(value: T): LiteralType<T> {
  const lt = new LiteralType(value, v => {
    if (value === v) return ((v: any): T); // eslint-disable-line flowtype/no-weak-types
    throw new ValidationError({ expected: lt, got: v });
  });
  return lt;
}

export function optional<T>(t: Type<T>): OptionalType<T> {
  return new OptionalType(t, v => {
    if ((v === null) || (v === void 0)) return v;
    return t.parse(v);
  });
}

export function Voptional<T>(t: VType<T>): VOptionalType<T> {
  return new VOptionalType(t, v => {
    if ((v === null) || (v === void 0)) return v;
    return t.validate(v);
  });
}

export function mapping<K: string, V>(keys: Type<K>, values: Type<V>): MappingType<K, V> {
  const m = new MappingType(keys, values, v => {
    const o = objectType.validate(v);
    const ks = Object.keys(o);
    const result = {};
    const errors = {};
    for (const key of ks) {
      const value = o[key];
      let kv; let vv; let ke; let ve;
      try { kv = keys.parse(key); } catch (e) { if (e instanceof ValidationError) ke = e; else throw e; }
      try { vv = values.parse(value); } catch (e) { if (e instanceof ValidationError) ve = e; else throw e; }
      if (ke || ve) { errors[key] = { key: ke, value: ve }; }
      else if (kv) result[kv] = vv;
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: m, got: v, errors });
    return result;
  });
  return m;
}

export function Vmapping<K: string, V>(keys: VType<K>, values: VType<V>): VMappingType<K, V> {
  const m = new VMappingType(keys, values, v => {
    const o = objectType.validate(v);
    const ks = Object.keys(o);
    const errors = {};
    for (const key of ks) {
      const value = o[key];
      let ke; let ve;
      try { keys.validate(key); } catch (e) { if (e instanceof ValidationError) ke = e; else throw e; }
      try { values.validate(value); } catch (e) { if (e instanceof ValidationError) ve = e; else throw e; }
      if (ke || ve) { errors[key] = { key: ke, value: ve }; }
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: m, got: v, errors });
    return ((v: any): {[key: K]: V}); // eslint-disable-line flowtype/no-weak-types
  });
  return m;
}

export function unionFromObjectKeys<O: Object>(o: O): Type<$Keys<O>> {
  const en = new Type('enum', v => {
    const keys = Object.keys(o);
    if (~keys.indexOf(v)) return ((v: any): $Keys<O>);  // eslint-disable-line flowtype/no-weak-types
    throw new ValidationError({ expected: en, got: v });
  });
  return en;
}

export function object<S: {[key: string]: Type<any>}>(s: S): ObjectType<S, $ObjMap<S, <F>(v: Type<F>) => F>> {
  const os = new ObjectType(s, v => {
    const o = objectType.validate(v);
    const keys = Object.keys(s);
    const result = {};
    const errors = {};
    for (const key of keys) {
      try { result[key] = s[key].parse(o[key]); } catch (e) { if (e instanceof ValidationError) errors[key] = e; else throw e; }
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: os, got: o, errors });
    return result;
  });
  return os;
}

export function Vobject<S: {[key: string]: VType<any>}>(s: S): VObjectType<S, $ObjMap<S, <F>(v: VType<F>) => F>> {
  const os = new VObjectType(s, v => {
    const o = objectType.validate(v);
    const keys = Object.keys(s);
    const errors = {};
    for (const key of keys) {
      try { s[key].validate(o[key]); } catch (e) { if (e instanceof ValidationError) errors[key] = e; else throw e; }
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: os, got: o, errors });
    return o;
  });
  return os;
}

export function objectExact<S: {[key: string]: Type<any>}>(s: S): ObjectExactType<S, $Exact<$ObjMap<S, <F>(v: Type<F>) => F>>> {
  const oes = new ObjectExactType(s, v => {
    const o = objectType.validate(v);
    const keys = Object.keys(o);
    const result = {};
    const errors = {};
    for (const key of keys) {
      if (!s.hasOwnProperty(key)) { errors[key] = new ValidationError({ expected: noProperty, got: o[key] }); }
      else try { result[key] = s[key].parse(o[key]); } catch (e) { if (e instanceof ValidationError) errors[key] = e; else throw e; }
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: oes, got: o, errors });
    return result;
  });
  return oes;
}

export function VobjectExact<S: {[key: string]: VType<any>}>(s: S): VObjectExactType<S, $Exact<$ObjMap<S, <F>(v: VType<F>) => F>>> {
  const oes = new VObjectExactType(s, v => {
    const o = objectType.validate(v);
    const keys = Object.keys(o);
    const errors = {};
    for (const key of keys) {
      if (!s.hasOwnProperty(key)) { errors[key] = new ValidationError({ expected: noProperty, got: o[key] }); }
      else try { s[key].validate(o[key]); } catch (e) { if (e instanceof ValidationError) errors[key] = e; else throw e; }
    }
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: oes, got: o, errors });
    return o;
  });
  return oes;
}

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
