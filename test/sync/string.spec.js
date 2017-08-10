// @flow
/* eslint-env mocha */

import { expect } from "chai";

import { string, ValidationError } from "../../src";

describe("string", () => {
  describe("#parse", () => {
    it("returns on expected type", () => {
      const s = string.parse("hello");
      (s: string);
      // $ExpectError
      (s: number);
      // $ExpectError
      (s: Object);
      expect(s).to.equal("hello");
    });
    it("throws on wrong type", () => {
      const errorShape = got => ({ expected: { name: string.name }, got });
      try {
        string.parse();
        throw new Error();
      } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal(errorShape(void 0));
      }
      const date = new Date();
      try {
        string.parse(date);
        throw new Error();
      } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal(errorShape(date));
      }
    });
  });
  describe("#validate", () => {
    it("returns on expected type", () => {
      const s = string.validate("hello");
      (s: string);
      // $ExpectError
      (s: Array<string>);
      expect(s).to.equal("hello");
    });
    it("throws on wrong type", () => {
      const errorShape = got => ({ expected: { name: string.name }, got });
      try {
        string.validate();
        throw new Error();
      } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal(errorShape(void 0));
      }
      const date = new Date();
      try {
        string.validate(date);
        throw new Error();
      } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal(errorShape(date));
      }
    });
  });
  describe("#toDate", () => {
    it("returns on expected type", () => {
      const date = new Date();
      const dateString = String(date);
      const d = string.toDate().parse(dateString);
      (d: Date);
      // $ExpectError
      (d: boolean);
      expect(d.toString()).to.equal(date.toString());
    });
    it("throws on wrong type", () => {
      try {
        string.toDate().parse("not a date");
        throw new Error();
      } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal({
          expected: { name: string.toDate().name },
          got: "not a date"
        });
      }
      const date = new Date();
      try {
        string.toDate().parse(date);
        throw new Error();
      } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal({
          expected: { name: string.name },
          got: date
        });
      }
    });
  });
  describe("#isEmail", () => {
    it("returns on expected type", () => {
      const e = string.isEmail().validate("gobi301@gmail.com");
      (e: string);
      // $ExpectError
      (e: number);
      expect(e).to.equal("gobi301@gmail.com");
    });
    it("throws on wrong type", () => {
      const errorShape = got => ({
        expected: { name: string.name },
        got,
        description: "invalid email"
      });
      try {
        string.isEmail().validate("invalid@mail");
        throw new Error();
      } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal(errorShape("invalid@mail"));
      }
      const date = new Date();
      try {
        string.isEmail().validate(date);
        throw new Error();
      } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal({
          expected: { name: string.name },
          got: date
        });
      }
    });
  });
});
