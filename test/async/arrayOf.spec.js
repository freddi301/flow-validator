// @flow
/* eslint-env mocha, es6 */

import { expect } from 'chai';

import { asyncArrayOf, asyncVarrayOf, string, ValidationError } from '../../src';

async function apiOk(x) { return x; }
async function apiFail(x, error) { throw new error(String(x)); }

describe('asyncArrayOf', () => {
  it('resolves on expected type', async () => {
    const a = await asyncArrayOf(string.async()).parse(['hello', 'bye']);
    (a: Array<string>);
    // $ExpectError
    (a: Array<number>);
    expect(a).to.deep.equal(['hello', 'bye']);
    expect(await asyncArrayOf(string.async().to(apiOk)).parse(['hello', 'bye'])).to.deep.equal(['hello', 'bye']);
  });
  it('rejects on invalid type', async () => {
    const data = ['hello', Date];
    try { await asyncArrayOf(string.async()).parse(data); throw new Error(); } catch (e) {
       expect(e).to.be.instanceof(ValidationError);
       expect(e.toJSON()).deep.equal({
        expected: { name: "arrayOf" }, got: data,
        errors: { "1": { expected: { name: string.name }, got: Date } }
        });
     }
  });
  it('rejects if .to() rejects', async () => {
    const data = ['hello', 'bye'];
    try { await asyncArrayOf(string.async().to(apiFail)).parse(data); throw new Error(); } catch (e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).deep.equal({
        expected: { name: "arrayOf" }, got: data,
        errors: {
          "0": { expected: { name: 'transformation' }, got: data[0], description: data[0] },
          "1": { expected: { name: 'transformation' }, got: data[1], description: data[1] },
        }
      });
     }
  });
});

describe('asyncVarrayOf', () => {
  it('resolves on expected type', async () => {
    const data = ['hello', 'bye'];
    const a = await asyncVarrayOf(string.Vasync()).validate(data);
    (a: Array<string>);
    // $ExpectError
    (a: Array<Date>);
    expect(a).to.deep.equal(data);
    expect(await asyncVarrayOf(string.Vasync()).validate(data)).to.equal(data);
    expect(await asyncVarrayOf(string.Vasync().Vrefine(apiOk)).validate(data)).to.deep.equal(data);
    expect(await asyncVarrayOf(string.Vasync().Vrefine(apiOk)).validate(data)).to.equal(data);
  });
  it('rejects on invalid type', async () => {
    const data = ['hello', Date];
    try { await asyncVarrayOf(string.Vasync()).validate(data); throw new Error(); } catch (e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).deep.equal({
        expected: { name: "arrayOf" }, got: data,
        errors: { "1": { expected: { name: 'string' }, got: data[1] } }
      });
     }
  });
  it('rejects if .refine() rejects', async () => {
    const data = ['hello', 'bye'];
    try { await asyncVarrayOf(string.Vasync().Vrefine(apiFail)).parse(data); throw new Error(); } catch (e) {
      expect(e).to.be.instanceof(ValidationError);
      expect(e.toJSON()).deep.equal({
        expected: { name: "arrayOf" }, got: data,
        errors: {
          "0": { expected: { name: 'refined' }, got: data[0], description: data[0] },
          "1": { expected: { name: 'refined' }, got: data[1], description: data[1] },
        }
      });
    }
  });
});
