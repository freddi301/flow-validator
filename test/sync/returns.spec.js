// @flow
/* eslint-env mocha, es6 */

import { expect } from 'chai';

import { returns, Vreturns, Vobject, object, string, number, Type, VType, ValidationError } from '../../src';

describe('takes', () => {
  const os: Type<{ name: string, age: number }> = object({ name: string, age: number });
  const decorator = returns(os);
  const decorated = decorator((s, { name, age }) => {
    (s: string); (name: string); (age: number);
    // $ExpectError
    (name: number);
    // $ExpectError
    (age: string);
    return { name, age };
  });
  it('returns on expected type', () => {
    const r = decorated('Mr.', { name: 'Fred', age: 124 });
    // $ExpectError
    (r: number);
    // $ExpectError
    (r.age: Date);
    (r: Object);
    (r: typeof os.type);
    (r.name: string);
    (r.age: number);
    expect(r).to.deep.equal({ name: 'Fred', age: 124 });
  });
  it('throws on wrong type', () => {
    // $ExpectError
    try { decorated('hello', { name: 'Fred' }); } catch(e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).to.be.deep.equal({
        expected: { name: 'object' },
        got: { name: 'Fred', age: undefined },
        errors: { age: { expected: { name: 'number' }, got: undefined } }
      });
    }
  });
});

describe('Vtakes', () => {
  const os: VType<{ name: string, age: number }> = Vobject({ name: string, age: number });
  const decorator = Vreturns(os);
  const decorated = decorator((s, { name, age }) => {
    (s: string); (name: string); (age: number);
    // $ExpectError
    (name: number);
    // $ExpectError
    (age: string);
    return { name, age };
  });
  it('returns on expected type', () => {
    const r = decorated('Mr.', { name: 'Fred', age: 124 });
    // $ExpectError
    (r: number);
    // $ExpectError
    (r.age: Date);
    (r: Object);
    (r: typeof os.type);
    (r.name: string);
    (r.age: number);
    expect(r).to.deep.equal({ name: 'Fred', age: 124 });
  });
  it('throws on wrong type', () => {
    // $ExpectError
    try { decorated('hello', { name: 'Fred' }); } catch(e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).to.be.deep.equal({
        expected: { name: 'object' },
        got: { name: 'Fred', age: undefined },
        errors: { age: { expected: { name: 'number' }, got: undefined } } 
      });
    }
  });
});
