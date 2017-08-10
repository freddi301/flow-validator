// @flow

import { ValidationError } from "./ValidationError";
import { Type } from "./Type";
import { AsyncVType } from "../async/AsyncVType";
import { Vintersection } from "./Vintersection";
import { Vunion } from "./Vunion";
import { Voptional } from "./Voptional";

export class VType<T> extends Type<T> {
  validate: (value: mixed) => T;
  constructor(name: string, validate: (value: mixed) => T) {
    super(name, validate);
    this.validate = validate;
  }
  Vrefine(
    refinement: (v: T, error: (err: string) => ValidationError) => T
  ): VRefinedType<T> {
    const rf = new VRefinedType(this, v =>
      refinement(
        this.parse(v),
        (err: string) =>
          new ValidationError({ expected: rf, got: v, description: err })
      )
    );
    return rf;
  }
  isValid(v: mixed): boolean {
    try {
      this.validate(v);
      return true;
    } catch (e) {
      if (e instanceof ValidationError) return false;
      throw e;
    }
  }
  validateResult(v: mixed): { value: T } | { error: ValidationError } {
    try {
      return { value: this.validate(v) };
    } catch (e) {
      if (e instanceof ValidationError) return { error: e };
      throw e;
    }
  }
  Vand<T2>(t2: VType<T2>): VIntersectionType<T, T2> {
    return Vintersection(this, t2);
  }
  Vor<T2>(t2: VType<T2>): VUnionType<T, T2> {
    return Vunion(this, t2);
  }
  Voptional(): VOptionalType<T> {
    return Voptional(this);
  }
  Vasync(): AsyncVType<T> {
    return new AsyncVType(this.name, this.validate);
  }
}

export class InstanceOfType<T> extends VType<T> {
  class: Class<T>;
  constructor(c: Class<T>, validate: (value: mixed) => T) {
    super("instanceof", validate);
    this.class = c;
  }
}

export class ClassOfType<T> extends VType<T> {
  class: T;
  constructor(c: T, validate: (value: mixed) => T) {
    super("classOf", validate);
    this.class = c;
  }
}

export class VArrayOfType<T> extends VType<Array<T>> {
  itemType: VType<T>;
  constructor(t: VType<T>, validate: (value: mixed) => Array<T>) {
    super("arrayOf", validate);
    this.itemType = t;
  }
}

export class VIntersectionType<A, B> extends VType<A & B> {
  typeA: VType<A>;
  typeB: VType<B>;
  constructor(a: VType<A>, b: VType<B>, validate: (value: mixed) => A & B) {
    super("intersection", validate);
    this.typeA = a;
    this.typeB = b;
  }
}

export class VUnionType<A, B> extends VType<A | B> {
  typeA: VType<A>;
  typeB: VType<B>;
  constructor(a: VType<A>, b: VType<B>, validate: (value: mixed) => A | B) {
    super("union", validate);
    this.typeA = a;
    this.typeB = b;
  }
}

export class LiteralType<T> extends VType<T> {
  value: T;
  constructor(t: T, validate: (value: mixed) => T) {
    super("literal", validate);
    this.value = t;
  }
}

export class VOptionalType<T> extends VType<?T> {
  innerType: VType<T>;
  constructor(t: VType<T>, validate: (value: mixed) => ?T) {
    super("optional", validate);
    this.innerType = t;
  }
}

export class VMappingType<K, V> extends VType<{ [key: K]: V }> {
  keys: VType<K>;
  values: VType<V>;
  constructor(
    keys: VType<K>,
    values: VType<V>,
    validate: (value: mixed) => { [key: K]: V }
  ) {
    super("mapping", validate);
    this.keys = keys;
    this.values = values;
  }
}

export class VObjectType<
  S: { [key: string]: VType<any> },
  T: $ObjMap<S, <F>(v: VType<F>) => F>
> extends VType<T> {
  schema: S;
  constructor(schema: S, validate: (value: mixed) => T) {
    super("object", validate);
    this.schema = schema;
  }
}

export class VObjectExactType<
  S: { [key: string]: VType<any> },
  T: $ObjMap<S, <F>(v: VType<F>) => F>
> extends VType<T> {
  schema: S;
  constructor(schema: S, validate: (value: mixed) => T) {
    super("objectExact", validate);
    this.schema = schema;
  }
}

export class VTupleType<T> extends VType<T> {
  schema: Array<VType<any>>;
  constructor(schema: Array<VType<any>>, validate: (value: mixed) => T) {
    super("tuple", validate);
    this.schema = schema;
  }
}

export class VRefinedType<T> extends VType<T> {
  base: VType<T>;
  constructor(base: VType<T>, f: (v: mixed) => T) {
    super("refined", f);
    this.base = base;
  }
  revalidate(): VType<T> {
    return new VType("revalidated", v => this.base.validate(this.validate(v)));
  }
}
