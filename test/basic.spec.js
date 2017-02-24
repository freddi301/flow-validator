// @flow

import { expect } from 'chai';

import { object, string, number, ValidationError } from '../src';

describe('ValidationError', () => {
  it('is instance of itself', () => {
    expect((new ValidationError({ expected: string, got: null })) instanceof ValidationError).to.equal(true);
  });
});

describe('basic', () => {
  it('works', () => {
    object({ a: number, g: string }).validate({ a: 3, g: 'hello' });
    //try { object({ a: number, g: string }).validate({ a: 5 }) } catch (e) { console.log(JSON.stringify(e.toJSON(), null, 2)) }
    expect(() => object({ a: number, g: string }).validate({})).to.throw;
  });
});

describe('error JSON', () => {
  it('works', () => {
    try {
      string.validate(3);
    } catch (e) {
      expect(e).instanceof(ValidationError);
      expect(JSON.parse(JSON.stringify(e.toJSON()))).to.deep.equal({ expected: { name: 'string' }, got: 3 })
    }
  });
  it('works with custom error', () => {
    try {
      string.refine((s, error) => { if (s === 'hello') return s; throw error('must be hello') }).validate('helo')
    } catch (e) {
      expect(e).instanceof(ValidationError);
      expect(JSON.parse(JSON.stringify(e.toJSON()))).to.deep.equal({ expected: 'must be hello', got: 'helo' })
    }
  });

});
