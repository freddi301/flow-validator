// @flow
/* eslint-env mocha, es6 */

import { expect } from "chai";

import {
  asyncReturns,
  asyncVreturns,
  asyncVobject,
  asyncObject,
  string,
  number,
  AsyncType,
  AsyncVType,
  ValidationError
} from "../../src";

describe("takes", () => {
  const os: AsyncType<{ name: string, age: number }> = asyncObject({
    name: string.async(),
    age: number.async()
  });
  const decorator = asyncReturns(os);
  const decorated = decorator((s, { name, age }) => {
    (s: string);
    (name: string);
    (age: number);
    // $ExpectError
    (name: number);
    // $ExpectError
    (age: string);
    return { name, age };
  });
  it("asyncReturns on expected AsyncType", async () => {
    const r = await decorated("Mr.", { name: "Fred", age: 124 });
    // $ExpectError
    (r: number);
    // $ExpectError
    (r.age: Date);
    (r: Object);
    (r: typeof os.type);
    (r.name: string);
    (r.age: number);
    expect(r).to.deep.equal({ name: "Fred", age: 124 });
  });
  it("throws on wrong AsyncType", () => {
    try {
      // $ExpectError
      decorated("hello", { name: "Fred" });
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).to.be.deep.equal({
        expected: { name: "asyncObject" },
        got: { name: "Fred", age: undefined },
        errors: { age: { expected: { name: "number" }, got: undefined } }
      });
    }
  });
});

describe("Vtakes", () => {
  const os: AsyncVType<{ name: string, age: number }> = asyncVobject({
    name: string.Vasync(),
    age: number.Vasync()
  });
  const decorator = asyncVreturns(os);
  const decorated = decorator(async (s, { name, age }) => {
    (s: string);
    (name: string);
    (age: number);
    // $ExpectError
    (name: number);
    // $ExpectError
    (age: string);
    return { name, age };
  });
  it("asyncReturns on expected AsyncType", async () => {
    const r = await decorated("Mr.", { name: "Fred", age: 124 });
    // $ExpectError
    (r: number);
    // $ExpectError
    (r.age: Date);
    (r: typeof os.type);
    (r.name: string);
    (r.age: number);
    expect(r).to.deep.equal({ name: "Fred", age: 124 });
  });
  it("throws on wrong AsyncType", async () => {
    try {
      // $ExpectError
      await decorated("hello", { name: "Fred" });
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).to.be.deep.equal({
        expected: { name: "asyncObject" },
        got: { name: "Fred", age: undefined },
        errors: { age: { expected: { name: "number" }, got: undefined } }
      });
    }
  });
});
