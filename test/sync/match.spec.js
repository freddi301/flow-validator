// @flow
/* eslint-env mocha, es6 */

import { expect } from "chai";

import { match, string, number, ValidationError } from "../../src";

describe("match", () => {
  it("works", () => {
    const x = match(1, number, n => new Date(n * 2), string, s => [s, s]);
    expect(x.getTime()).to.equal(new Date(2).getTime());
    (x: Date);
    // $ExpectError
    (x: [string, string]);
    const y = match("2", number, n => new Date(n * 2), string, s => [s, s]);
    expect(y).to.deep.equal(["2", "2"]);
    (y: [string, string]);
    // $ExpectError
    (y: Date);
    try {
      const z = match(null, number, n => new Date(n * 2), string, s => [s, s]);
      (z: [string, string] | Date);
      // $ExpectError
      (z: Date);
    } catch (e) {
      expect(e).instanceof(ValidationError);
    }
  });
});
