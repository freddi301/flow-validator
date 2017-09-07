// @flow

import { ValidationError } from "../sync/ValidationError";
import { asyncUnion } from "./asyncUnion";
import { asyncIntersection } from "./asyncIntersection";
import { asyncOptional } from "./asyncOptional";

export class AsyncType<T> {
  name: string;
  parse: (value: mixed) => Promise<T>;
  type: T;
  constructor(name: string, parse: (value: mixed) => Promise<T>) {
    this.name = name;
    this.parse = parse;
  }
  to<T2>(
    transformation: (
      v: T,
      error: (e: string) => ValidationError
    ) => T2 | Promise<T2>
  ): AsyncType<T2> {
    const tr = new AsyncType("transformation", async v => {
      const vResolved = await v;
      return transformation(
        await this.parse(v),
        (err: string) =>
          new ValidationError({
            expected: tr,
            got: vResolved,
            description: err
          })
      );
    });
    return tr;
  }
  refine(
    refinement: (v: T, error: (e: string) => ValidationError) => Promise<T>
  ): AsyncRefinedType<T> {
    const rf = new AsyncRefinedType(this, async v =>
      refinement(
        await this.parse(v),
        (err: string) =>
          new ValidationError({ expected: rf, got: v, description: err })
      )
    );
    return rf;
  }
  and<T2>(t2: AsyncType<T2>): AsyncIntersectionType<T, T2> {
    return asyncIntersection(this, t2);
  }
  or<T2>(t2: AsyncType<T2>): AsyncUnionType<T, T2> {
    return asyncUnion(this, t2);
  }
  optional(): AsyncOptionalType<T> {
    return asyncOptional(this);
  }
  chain<T2>(t2: AsyncType<T2>): AsyncChainType<T2> {
    return new AsyncChainType(this, t2);
  }
  compose<T2>(f: (v: T) => T2 | Promise<T2>): AsyncComposeLeftType<T, T2> {
    return new AsyncComposeLeftType(this, (v: T) => Promise.resolve(v).then(f));
  }
  toJSON() {
    return { name: this.name };
  }
}

export class AsyncRefinedType<T> extends AsyncType<T> {
  base: AsyncType<T>;
  constructor(base: AsyncType<T>, f: (v: mixed) => Promise<T>) {
    super("refined", f);
    this.base = base;
  }
  revalidate(): AsyncType<T> {
    return new AsyncType("revalidated", async v =>
      this.base.parse(await this.parse(v))
    );
  }
}

export class AsyncIntersectionType<A, B> extends AsyncType<A & B> {
  typeA: AsyncType<A>;
  typeB: AsyncType<B>;
  constructor(
    a: AsyncType<A>,
    b: AsyncType<B>,
    parse: (value: mixed) => Promise<A & B>
  ) {
    super("intersection", parse);
    this.typeA = a;
    this.typeB = b;
  }
}

export class AsyncUnionType<A, B> extends AsyncType<A | B> {
  typeA: AsyncType<A>;
  typeB: AsyncType<B>;
  constructor(
    a: AsyncType<A>,
    b: AsyncType<B>,
    validate: (value: mixed) => Promise<A | B>
  ) {
    super("union", validate);
    this.typeA = a;
    this.typeB = b;
  }
}

export class AsyncOptionalType<T> extends AsyncType<?T> {
  innerType: AsyncType<T>;
  constructor(t: AsyncType<T>, validate: (value: mixed) => Promise<?T>) {
    super("optional", validate);
    this.innerType = t;
  }
}

export class AsyncChainType<T> extends AsyncType<T> {
  left: AsyncType<any>;
  right: AsyncType<T>;
  constructor(left: AsyncType<any>, right: AsyncType<T>) {
    super("compound", async v => right.parse(await left.parse(v)));
    this.left = left;
    this.right = right;
  }
}

export class AsyncComposeLeftType<T, T2> extends AsyncType<T2> {
  left: AsyncType<T>;
  right: (v: T) => Promise<T2>;
  constructor(left: AsyncType<T>, right: (v: T) => Promise<T2>) {
    super("composeLeft", async v => right(await left.parse(v)));
    this.left = left;
    this.right = right;
  }
}
