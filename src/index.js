// @flow

export class Type<T> {
  name: string;
  parse: (value: mixed) => T;
  type: T;
  constructor(name: string, parse: (value: mixed) => T) {
    this.name = name;
    this.parse = parse;
  }
  to<T2>(transformation: (v: T, error: (e: string) => ValidationError) => T2): Type<T2> {
    const tr = new Type('transformation', v => transformation(
      this.parse(v),
      (err: string) => new ValidationError({ expected: tr, got: v, description: err }))
    );
    return tr;
  }
  refine(refinement: (v: T, error: (e: string) => ValidationError) => T): RefinedType<T> {
    const rf = new RefinedType(this, v => refinement(
      this.parse(v),
      (err: string) => new ValidationError({ expected: rf, got: v, description: err }))
    );
    return rf;
  }
  and<T2>(t2: Type<T2>): IntersectionType<T, T2> { return intersection(this, t2); }
  or<T2>(t2: Type<T2>): UnionType<T, T2> { return union(this, t2); }
  optional(): OptionalType<T> { return optional(this); }
  chain<T2>(t2: Type<T2>): ChainType<T2> { return new ChainType(this, t2); }
  compose<T2>(f: (v: T) => T2): ComposeLeftType<T, T2> { return composeLeft(this, f);  }
  parseResult(v: mixed): { value: T } | { error: ValidationError } {
    try { return { value: this.parse(v) }; } catch (e) { if (e instanceof ValidationError) return { error: e }; throw e; }
  }
  toJSON() { return { name: this.name }; }
  async(): AsyncType<T> { return new AsyncType(this.name, this.parse); }
}

export class VType<T> extends Type<T> {
  validate: (value: mixed) => T;
  constructor(name: string, validate: (value: mixed) => T) {
    super(name, validate);
    this.validate = validate;
  }
  Vrefine(refinement: (v: T, error: (err: string) => ValidationError) => T): VRefinedType<T> {
    const rf = new VRefinedType(this, v => refinement(
      this.parse(v),
      (err: string) => new ValidationError({ expected: rf, got: v, description: err }))
    );
    return rf;
  }
  isValid(v: mixed): boolean {
    try { this.validate(v); return true; } catch (e) { if (e instanceof ValidationError) return false; throw e; }
  }
  validateResult(v: mixed): { value: T } | { error: ValidationError } {
    try { return { value: this.validate(v) }; } catch (e) { if (e instanceof ValidationError) return { error: e }; throw e; }
  }
  Vand<T2>(t2: VType<T2>): VIntersectionType<T, T2> { return Vintersection(this, t2); }
  Vor<T2>(t2: VType<T2>): VUnionType<T, T2> { return Vunion(this, t2); }
  Voptional(): VOptionalType<T> { return Voptional(this); }
  Vasync(): AsyncVType<T> { return new AsyncVType(this.name, this.validate); }
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
  itemType: Type<T>;
  constructor(t: Type<T>, parse: (value: mixed) => Array<T>) {
    super('arrayOf', parse);
    this.itemType = t;
  }
}

export class VArrayOfType<T> extends VType<Array<T>> {
  itemType: VType<T>;
  constructor(t: VType<T>, validate: (value: mixed) => Array<T>) {
    super('arrayOf', validate);
    this.itemType = t;
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
  innerType: Type<T>;
  constructor(t: Type<T>, validate: (value: mixed) => ?T) { super('optional', validate); this.innerType = t; }
}

export class VOptionalType<T> extends VType<?T> {
  innerType: VType<T>;
  constructor(t: VType<T>, validate: (value: mixed) => ?T) { super('optional', validate); this.innerType = t; }
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

export class ComposeLeftType<T, T2> extends Type<T2> {
  left: Type<T>;
  right: (v: T) => T2;
  constructor(left: Type<T>, right: (v: T) => T2) {
    super('composeLeft', v => right(left.parse(v)));
    this.left = left;
    this.right = right;
  }
}

export class ComposeRightType<T, T2> extends Type<T2> {
  left: (v: T) => T2;
  right: Type<T>;
  constructor(left: (v: T) => T2, right: Type<T>) {
    super('compound', v => left(right.parse(v)));
    this.left = left;
    this.right = right;
  }
}

export type Errors = {[key: string]: ValidationError };
export type ValidationErrorPayload = { expected: Type<any> | AsyncType<any>, got: mixed, errors?: Errors, description?: string };
export type ValidationErrorJSONPayload = {
  expected: { name: string }, description?: string,
  got: any, errors?: {[key: string]: ValidationErrorJSONPayload }
};
export class ValidationError extends Error {
  payload: ValidationErrorPayload;
  constructor(payload: ValidationErrorPayload) { super('ValidationError'); this.payload = payload; }
  toJSON(): ValidationErrorJSONPayload {
    const payload: ValidationErrorJSONPayload = { expected: this.payload.expected.toJSON(), got: this.payload.got };
    if (this.payload.description) payload.description = this.payload.description;
    if (this.payload.errors) {
      const errors = {};
      for (const key of Object.keys(this.payload.errors)) { errors[key] = this.payload.errors[key].toJSON(); }
      payload.errors = errors;
    }
    return payload;
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

export class StringType extends VType<string> {
  constructor(parse: (value: mixed) => string) {
    super('string', parse);
  }
  isValidDate(): StringType {
    const dt = new StringType(v => {
      const s = string.parse(v);
      const date: Date = new Date(s);
      if ( Object.prototype.toString.call(date) === "[object Date]") {
        if ( isNaN( date.getTime() ) ) { throw new ValidationError({ expected: dt, got: v}); }
        else { return s; }
      } else { throw new ValidationError({ expected: dt, got: v, description: 'invalid date' }); }
    });
    return dt;
  }
  toDate(): Type<Date> {
    const dt = new Type('date', v => {
      const s = string.parse(v);
      const date: Date = new Date(s);
      if ( Object.prototype.toString.call(date) === "[object Date]") {
        if ( isNaN( date.getTime() ) ) { throw new ValidationError({ expected: dt, got: v }); }
        else { return date; }
      } else { throw new ValidationError({ expected: dt, got: v, description: 'invalid date'}); }
    });
    return dt;
  }
  isEmail(): StringType {
    const em = new StringType(v => {
      const s = string.validate(v);
      const isEmail = (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(s);
      if (isEmail) return s;
      throw new ValidationError({ expected: em, got: v, description: 'invalid email' });
    });
    return em;
  }
}

export const string: StringType = new StringType(v => {
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
    b.parse(v); // TODO: which one to take? how to merge
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
    return (result: any);
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
    return (o: any);
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

export function composeLeft<T1, T2>(a: Type<T1>, b: (v: T1) => T2): ComposeLeftType<T1, T2> { // a,b -> b(a())
  return new ComposeLeftType(a, b);
}

export function composeRight<T1, T2>(a: (v: T1) => T2, b: Type<T1>): ComposeRightType<T1, T2> { // a,b -> a(b())
  return new ComposeRightType(a, b);
}

export function syncFunctionToAsync<T>(f: (value: mixed) => T | Promise<T>): (value: mixed) => Promise<T> {
  return v => Promise.resolve(v).then(f);
}

export class AsyncType<T> {
  name: string;
  parse: (value: mixed) => Promise<T>;
  type: T;
  constructor(name: string, parse: (value: mixed) => T | Promise<T>) {
    this.name = name;
    this.parse = syncFunctionToAsync(parse);
  }
  to<T2>(transformation: (v: T, error: (e: string) => ValidationError) => T2 | Promise<T2>): AsyncType<T2> {
    const tr = new Type('transformation', async (v) => transformation(
      await this.parse(v),
      (err: string) => new ValidationError({ expected: tr, got: v, description: err }))
    );
    return tr;
  }
  refine(refinement: (v: T, error: (e: string) => ValidationError) => T | Promise<T>): AsyncRefinedType<T> {
    const rf = new AsyncRefinedType(this, async (v) => refinement(
      await this.parse(v),
      (err: string) => new ValidationError({ expected: rf, got: v, description: err }))
    );
    return rf;
  }
  and<T2>(t2: AsyncType<T2>): AsyncIntersectionType<T, T2> { return asyncIntersection(this, t2); }
  or<T2>(t2: AsyncType<T2>): AsyncUnionType<T, T2> { return asyncUnion(this, t2); }
  optional(): AsyncOptionalType<T> { return asyncOptional(this); }
  chain<T2>(t2: AsyncType<T2>): AsyncChainType<T2> { return new AsyncChainType(this, t2); }
  compose<T2>(f: (v: T) => T2 | Promise<T2>): AsyncComposeLeftType<T, T2> {
    return new AsyncComposeLeftType(this, (v: T) => Promise.resolve(v).then(f));
  }
  toJSON() { return { name: this.name }; }
}

export class AsyncVType<T> extends AsyncType<T> {
  validate: (value: mixed) => Promise<T>;
  constructor(name: string, validate: (value: mixed) => T | Promise<T>) {
    super(name, validate);
    this.validate = syncFunctionToAsync(validate);
  }
  Vrefine(refinement: (v: T, error: (e: string) => ValidationError) => T | Promise<T>): AsyncVRefinedType<T> {
    const rf = new AsyncVRefinedType(this, async (v) => refinement(
      await this.parse(v),
      (err: string) => new ValidationError({ expected: rf, got: v, description: err }))
    );
    return rf;
  }
  Vand<T2>(t2: AsyncVType<T2>): AsyncVIntersectionType<T, T2> { return asyncVintersection(this, t2); }
  Vor<T2>(t2: AsyncVType<T2>): AsyncVUnionType<T, T2> { return asyncVunion(this, t2); }
  Voptional(): AsyncVOptionalType<T> { return asyncVoptional(this); }
}

export class AsyncRefinedType<T> extends AsyncType<T> {
  base: AsyncType<T>;
  constructor(base: AsyncType<T>, f: (v: mixed) => T | Promise<T>) {
    super('refined', f);
    this.base = base;
  }
  revalidate(): AsyncType<T> { return new AsyncType('revalidated', async (v) => this.base.parse(await this.parse(v))); }
}

export class AsyncVRefinedType<T> extends AsyncVType<T> {
  base: AsyncVType<T>;
  constructor(base: AsyncVType<T>, f: (v: mixed) => T | Promise<T>) {
    super('refined', f);
    this.base = base;
  }
  revalidate(): AsyncVType<T> { return new AsyncVType('revalidated', async (v) => this.base.validate(await this.validate(v))); }
}

export class AsyncIntersectionType<A, B> extends AsyncType<A & B> {
  typeA: AsyncType<A>;
  typeB: AsyncType<B>;
  constructor(a: AsyncType<A>, b: AsyncType<B>, parse: (value: mixed) => Promise<A & B>) {
    super('intersection', parse); this.typeA = a; this.typeB = b;
  }
}

export class AsyncVIntersectionType<A, B> extends AsyncVType<A & B> {
  typeA: AsyncVType<A>;
  typeB: AsyncVType<B>;
  constructor(a: AsyncVType<A>, b: AsyncVType<B>, validate: (value: mixed) => Promise<A & B>) {
    super('intersection', validate); this.typeA = a; this.typeB = b;
  }
}

export function asyncIntersection<A, B>(a: AsyncType<A>, b: AsyncType<B>): AsyncIntersectionType<A, B> {
  return new AsyncIntersectionType(a, b, async (v) => {
    await a.parse(v);
    await b.parse(v); // TODO: which one to take? how to merge
    return ((v: any): A & B); // eslint-disable-line flowtype/no-weak-types
  });
}

export function asyncVintersection<A, B>(a: AsyncVType<A>, b: AsyncVType<B>): AsyncVIntersectionType<A, B> {
  return new AsyncVIntersectionType(a, b, async (v) => {
    await a.validate(v);
    await b.validate(v);
    return ((v: any): A & B); // eslint-disable-line flowtype/no-weak-types
  });
}

export class AsyncUnionType<A, B> extends AsyncType<A | B> {
  typeA: AsyncType<A>;
  typeB: AsyncType<B>;
  constructor(a: AsyncType<A>, b: AsyncType<B>, validate: (value: mixed) => Promise<A | B>) {
    super('union', validate); this.typeA = a; this.typeB = b;
  }
}

export class AsyncVUnionType<A, B> extends AsyncVType<A | B> {
  typeA: AsyncVType<A>;
  typeB: AsyncVType<B>;
  constructor(a: AsyncVType<A>, b: AsyncVType<B>, validate: (value: mixed) => Promise<A | B>) {
    super('union', validate); this.typeA = a; this.typeB = b;
  }
}

export function asyncUnion<A, B>(a: AsyncType<A>, b: AsyncType<B>): AsyncUnionType<A, B> {
  const u = new AsyncUnionType(a, b, async (v) => {
    let left; let right;
    try { left = await a.parse(v); } catch (e) { if (e instanceof ValidationError); else throw e; }
    try { right = await b.parse(v); } catch (e) { if (e instanceof ValidationError); else throw e; }
    if (left) return left;
    if (right) return right;
    throw new ValidationError({ expected: u, got: v });
  });
  return u;
}

export function asyncVunion<A, B>(a: AsyncVType<A>, b: AsyncVType<B>): AsyncVUnionType<A, B> {
  const u = new AsyncVUnionType(a, b, async (v) => {
    let left; let right;
    try { left = await a.parse(v); } catch (e) { if (e instanceof ValidationError); else throw e; }
    try { right = await b.parse(v); } catch (e) { if (e instanceof ValidationError); else throw e; }
    if (left) return left;
    if (right) return right;
    throw new ValidationError({ expected: u, got: v });
  });
  return u;
}

export class AsyncOptionalType<T> extends AsyncType<?T> {
  innerType: AsyncType<T>;
  constructor(t: AsyncType<T>, validate: (value: mixed) => Promise<?T>) { super('optional', validate); this.innerType = t; }
}

export class AsyncVOptionalType<T> extends AsyncVType<?T> {
  innerType: AsyncVType<T>;
  constructor(t: AsyncVType<T>, validate: (value: mixed) => Promise<?T>) { super('optional', validate); this.innerType = t; }
}

export function asyncOptional<T>(t: AsyncType<T>): AsyncOptionalType<T> {
  return new AsyncOptionalType(t, async (v) => {
    if ((v === null) || (v === void 0)) return v;
    return t.parse(v);
  });
}

export function asyncVoptional<T>(t: AsyncVType<T>): AsyncVOptionalType<T> {
  return new AsyncVOptionalType(t, async (v) => {
    if ((v === null) || (v === void 0)) return v;
    return t.validate(v);
  });
}

export class AsyncChainType<T> extends AsyncType<T> {
  left: AsyncType<any>;
  right: AsyncType<T>;
  constructor(left: AsyncType<any>, right: AsyncType<T>) {
    super('compound', async (v) => right.parse(await left.parse(v)));
    this.left = left;
    this.right = right;
  }
}

export class AsyncComposeLeftType<T, T2> extends AsyncType<T2> {
  left: AsyncType<T>;
  right: (v: T) => Promise<T2>;
  constructor(left: AsyncType<T>, right: (v: T) => Promise<T2>) {
    super('composeLeft', async (v) => right(await left.parse(v)));
    this.left = left;
    this.right = right;
  }
}

export class AsyncArrayOfType<T> extends AsyncType<Array<T>> {
  innerType: AsyncType<T>;
  constructor(t: AsyncType<T>, parse: (value: mixed) => Array<T> | Promise<Array<T>>) {
    super('arrayOf', parse);
    this.innerType = t;
  }
}

export class AsyncVArrayOfType<T> extends AsyncVType<Array<T>> {
  innerType: AsyncVType<T>;
  constructor(t: AsyncVType<T>, validate: (value: mixed) => Array<T> | Promise<Array<T>>) {
    super('arrayOf', validate);
    this.innerType = t;
  }
}

export function asyncArrayOf<T>(t: AsyncType<T>): AsyncArrayOfType<T> {
  const aof = new AsyncArrayOfType(t, async (v) => {
    const a = arrayType.validate(v);
    const errors: Errors = {};
    const result: Array<T> = await Promise.all(a.map(async (item, index) => {
      try { return await t.parse(item); } catch (e) {
        if (e instanceof ValidationError) {
          errors[String(index)] = (e: ValidationError);
          return ((void 0): any);
        } else throw e;
      }
    }));
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: aof, got: v, errors });
    return result;
  });
  return aof;
}

export function asyncVarrayOf<T>(t: AsyncVType<T>): AsyncVArrayOfType<T> {
  const aof = new AsyncVArrayOfType(t, async(v) => {
    const a = arrayType.validate(v);
    const errors: Errors = {};
    await Promise.all(a.map(async (item, index) => {
      try { await t.validate(item); } catch (e) {
        if (e instanceof ValidationError) errors[String(index)] = (e: ValidationError);
        else throw e;
      }
    }));
    if (Object.getOwnPropertyNames(errors).length) throw new ValidationError({ expected: aof, got: v, errors });
    return ((a: any): Array<T>); // eslint-disable-line flowtype/no-weak-types
  });
  return aof;
}
