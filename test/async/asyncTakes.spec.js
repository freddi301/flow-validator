// @flow
/* eslint-env mocha, es6 */

import { expect } from "chai";

import {
  asyncTakes,
  asyncVtakes,
  asyncVobject,
  asyncObject,
  string,
  number,
  AsyncType,
  AsyncVType,
  ValidationError
} from "../../src";

describe("asyncTakes", () => {
  const os: AsyncType<{ name: string, age: number }> = asyncObject({
    name: string.async(),
    age: number.async()
  });
  const decorator = asyncTakes(string.async(), os);
  const decorated = decorator(async (s, { name, age }) => {
    const ret = [`${s}${name}`, age];
    (s: string);
    (name: string);
    (age: number);
    // $ExpectError
    (name: number);
    // $ExpectError
    (age: string);
    return ret;
  });
  it("returns on expected type", async () => {
    const r = await decorated("Mr.", { name: "Fred", age: 124 });
    (r[0]: string);
    (r[1]: number);
    // $ExpectError
    (r[0]: Object);
    // $ExpectError
    (r[1]: Date);
    expect(r).to.deep.equal(["Mr.Fred", 124]);
  });
  it("throws on wrong type", async () => {
    try {
      // $ExpectError
      decorated("hello", { name: "Fred" });
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).to.be.deep.equal({
        errors: {
          "1": {
            errors: { age: { expected: { name: "number" }, got: undefined } },
            expected: { name: "asyncObject" },
            got: { name: "Fred" }
          }
        },
        expected: { name: "tuple" },
        got: ["hello", { name: "Fred" }]
      });
    }
  });
});

describe("asyncVtakes", () => {
  const os: AsyncVType<{ name: string, age: number }> = asyncVobject({
    name: string.Vasync(),
    age: number.Vasync()
  });
  const decorator = asyncVtakes(string.Vasync(), os);
  const decorated = decorator(async (s, { name, age }) => {
    const ret = [`${s}${name}`, age];
    (s: string);
    (name: string);
    (age: number);
    // $ExpectError
    (name: number);
    // $ExpectError
    (age: string);
    return ret;
  });
  it("returns on expected type", async () => {
    const r = await decorated("Mr.", { name: "Fred", age: 124 });
    (r[0]: string);
    (r[1]: number);
    // $ExpectError
    (r[0]: Object);
    // $ExpectError
    (r[1]: Date);
    expect(r).to.deep.equal(["Mr.Fred", 124]);
  });
  it("throws on wrong type", () => {
    try {
      // $ExpectError
      decorated("hello", { name: "Fred" });
    } catch (e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).to.be.deep.equal({
        errors: {
          "1": {
            errors: { age: { expected: { name: "number" }, got: undefined } },
            expected: { name: "asyncObject" },
            got: { name: "Fred" }
          }
        },
        expected: { name: "tuple" },
        got: ["hello", { name: "Fred" }]
      });
    }
  });
});
