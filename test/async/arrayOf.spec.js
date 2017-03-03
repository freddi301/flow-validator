// @flow
/* eslint-env mocha, es6 */
/*
import { expect } from 'chai';


import { asyncArrayOf, asyncVarrayOf, string, ValidationError } from '../../src';

async function apiOk(x) { return x }
async function apiFail(x) { throw new Error(); }

describe('asyncArrayOf', () => {
  it('returns on expected type', async () => {
    expect(await asyncArrayOf(string.async()).parse(['hello'])).to.deep.equal(['hello']);
  });
});

describe('asyncVarrayOf', () => {

});
*/
/*
describe('#parse', () => {

  it('throws on wrong type', () => {
    const errorShape = got => ({ expected: { name: string.name }, got });
    try { string.parse(); } catch (e) { expect(e).to.be.instanceof(ValidationError).deep.equal(errorShape(void 0)); }
    const date = new Date;
    try { string.parse(date); } catch (e) { expect(e).to.be.instanceof(ValidationError).deep.equal(errorShape(date)); }
  });
});
describe('#validate', () => {
  it('returns on expected type', () => {
    expect(string.validate('hello')).to.equal('hello');
  });
  it('throws on wrong type', () => {
    const errorShape = got => ({ expected: { name: string.name }, got });
    try { string.validate(); } catch (e) { expect(e).to.be.instanceof(ValidationError).deep.equal(errorShape(void 0)); }
    const date = new Date;
    try { string.validate(date); } catch (e) { expect(e).to.be.instanceof(ValidationError).deep.equal(errorShape(date)); }
  });
});
*/
