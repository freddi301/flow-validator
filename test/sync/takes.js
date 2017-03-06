// @flow
/* eslint-env mocha, es6 */

import { expect } from 'chai';

import { takes, takesV, Vobject, object, string, number, Type, VType, ValidationError } from '../../src';

describe('takes', () => {
  const os: Type<{ name: string, age: number }> = object({ name: string, age: number });
  const decorator = takes(string, os);
  const decorated = decorator((s, { name, age }) => {
    (s: string); (name: string); (age: number);
    // $ExpectError
    (name: number);
    // $ExpectError
    (age: string);
    return [`${s}${name}`, age];
  });
  it('returns on expected type', () => {
    const r = decorated('Mr.', { name: 'Fred', age: 124 });
    (r[0]: string); (r[1]: number);
    // $ExpectError
    (r[0]: Object);
    // $ExpectError
    (r[1]: Date);
    expect(r).to.deep.equal(['Mr.Fred', 124]);
  });
  it('throws on wrong type', () => {
    // $ExpectError
    try { decorated('hello', { name: 'Fred' }); } catch(e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).to.be.deep.equal({
        "errors": {
          "1": {
            "errors": { "age": { "expected": { "name": "number" }, "got": undefined } },
            "expected": { "name": "object" },
            "got": { "name": "Fred" }
          }
        },
        "expected": { "name": "tuple" },
        "got": [ "hello", { "name": "Fred" } ]
      });
    }
  });
});

describe('takesV', () => {
  const os: VType<{ name: string, age: number }> = Vobject({ name: string, age: number });
  const decorator = takesV(string, os);
  const decorated = decorator((s, { name, age }) => {
    (s: string); (name: string); (age: number);
    // $ExpectError
    (name: number);
    // $ExpectError
    (age: string);
    return [`${s}${name}`, age];
  });
  it('returns on expected type', () => {
    const r = decorated('Mr.', { name: 'Fred', age: 124 });
    (r[0]: string); (r[1]: number);
    // $ExpectError
    (r[0]: Object);
    // $ExpectError
    (r[1]: Date);
    expect(r).to.deep.equal(['Mr.Fred', 124]);
  });
  it('throws on wrong type', () => {
    // $ExpectError
    try { decorated('hello', { name: 'Fred' }); } catch(e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).to.be.deep.equal({
        "errors": {
          "1": {
            "errors": { "age": { "expected": { "name": "number" }, "got": undefined } },
            "expected": { "name": "object" },
            "got": { "name": "Fred" }
          }
        },
        "expected": { "name": "tuple" },
        "got": [ "hello", { "name": "Fred" } ]
      });
    }
  });
});
