// @flow

import { ValidationError } from './ValidationError';
import { AsyncType } from '../async/AsyncType';
import { optional } from './optional';
import { intersection } from './intersection';
import { union } from './union';
import { composeLeft } from './composeLeft';

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
  default(value: T): Type<T> { // the default value to be used if supplied value is null or undefined
    return new Type('default', v => {
      if (v === null || v === void null) return value;
      return this.parse(v);
    });
  }
  force(value: T): Type<T> { // the default value is used if any validation error occurs
    return new Type('default', v => {
      try { return this.parse(v); }
      catch (e) { if (e instanceof ValidationError) return value; throw e; }
    });
  }
  async(): AsyncType<T> { return new AsyncType(this.name, this.parse); }
}

export class ArrayOfType<T> extends Type<Array<T>> {
  itemType: Type<T>;
  constructor(t: Type<T>, parse: (value: mixed) => Array<T>) {
    super('arrayOf', parse);
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

export class UnionType<A, B> extends Type<A | B> {
  typeA: Type<A>;
  typeB: Type<B>;
  constructor(a: Type<A>, b: Type<B>, validate: (value: mixed) => A | B) {
    super('union', validate); this.typeA = a; this.typeB = b;
  }
}

export class OptionalType<T> extends Type<?T> {
  innerType: Type<T>;
  constructor(t: Type<T>, validate: (value: mixed) => ?T) { super('optional', validate); this.innerType = t; }
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

// export type SchemaProps = {[key: string]: Type<any>};
//export type SchemaType<P> = $ObjMap<P, <T>(v: Type<T>) => T>;

export class ObjectType<S: {[key: string]: Type<any>}, T: $ObjMap<S, <F>(v: Type<F>) => F>> extends Type<T> {
  schema: S;
  constructor(schema: S, parse: (value: mixed) => T) {
    super('object', parse);
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

// export type TupleSchemaProps = Array<Type<any>>;
// export type TupleSchemaType<P> = $TupleMap<P, <T>(v: Type<T>) => T>;

export class TupleType<T> extends Type<T> {
  schema: Array<Type<any>>;
  constructor(schema: Array<Type<any>>, parse: (value: mixed) => T) {
    super('tuple', parse);
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
