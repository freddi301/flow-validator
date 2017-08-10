// @flow

import { ValidationError } from "../sync/ValidationError";
import { AsyncType } from "./AsyncType";
import { syncFunctionToAsync } from "./syncFunctionToAsync";
import { asyncVintersection } from "./asyncVintersection";
import { asyncVunion } from "./asyncVunion";
import { asyncVoptional } from "./asyncVoptional";

export class AsyncVType<T> extends AsyncType<T> {
  validate: (value: mixed) => Promise<T>;
  constructor(name: string, validate: (value: mixed) => T | Promise<T>) {
    super(name, validate);
    this.validate = syncFunctionToAsync(validate);
  }
  Vrefine(
    refinement: (v: T, error: (e: string) => ValidationError) => T | Promise<T>
  ): AsyncVRefinedType<T> {
    const rf = new AsyncVRefinedType(this, async v =>
      refinement(
        await this.parse(v),
        (err: string) =>
          new ValidationError({ expected: rf, got: v, description: err })
      )
    );
    return rf;
  }
  Vand<T2>(t2: AsyncVType<T2>): AsyncVIntersectionType<T, T2> {
    return asyncVintersection(this, t2);
  }
  Vor<T2>(t2: AsyncVType<T2>): AsyncVUnionType<T, T2> {
    return asyncVunion(this, t2);
  }
  Voptional(): AsyncVOptionalType<T> {
    return asyncVoptional(this);
  }
}

export class AsyncVOptionalType<T> extends AsyncVType<?T> {
  innerType: AsyncVType<T>;
  constructor(t: AsyncVType<T>, validate: (value: mixed) => Promise<?T>) {
    super("optional", validate);
    this.innerType = t;
  }
}

export class AsyncVUnionType<A, B> extends AsyncVType<A | B> {
  typeA: AsyncVType<A>;
  typeB: AsyncVType<B>;
  constructor(
    a: AsyncVType<A>,
    b: AsyncVType<B>,
    validate: (value: mixed) => Promise<A | B>
  ) {
    super("union", validate);
    this.typeA = a;
    this.typeB = b;
  }
}

export class AsyncVIntersectionType<A, B> extends AsyncVType<A & B> {
  typeA: AsyncVType<A>;
  typeB: AsyncVType<B>;
  constructor(
    a: AsyncVType<A>,
    b: AsyncVType<B>,
    validate: (value: mixed) => Promise<A & B>
  ) {
    super("intersection", validate);
    this.typeA = a;
    this.typeB = b;
  }
}

export class AsyncVRefinedType<T> extends AsyncVType<T> {
  base: AsyncVType<T>;
  constructor(base: AsyncVType<T>, f: (v: mixed) => T | Promise<T>) {
    super("refined", f);
    this.base = base;
  }
  revalidate(): AsyncVType<T> {
    return new AsyncVType("revalidated", async v =>
      this.base.validate(await this.validate(v))
    );
  }
}
