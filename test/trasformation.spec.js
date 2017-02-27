// @flow
/* eslint-env mocha */

import { expect } from 'chai';

import { object, number, ValidationError, Type } from '../src';

describe('trasformation', () => {
  it('works with number -> string in object', () => {
    const numberToString: Type<string> = number.to(n => String(n));
    expect(numberToString.validate(4)).to.equal('4');
    expect(numberToString.parse(4)).to.equal('4');
    try { numberToString.validate(); } catch (e) { expect(e).to.be.instanceof(ValidationError); }
    const obj = object({ x: numberToString });
    expect(obj.validate({ x: 4 })).to.deep.equal({ x: 4 });
    expect(obj.parse({ x: 4 })).to.deep.equal({ x: '4' });
    try { obj.validate({}); } catch (e) { expect(e).to.be.instanceof(ValidationError); }
  });
});
