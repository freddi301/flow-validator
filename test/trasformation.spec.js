// @flow
/* eslint-env mocha */

import { expect } from 'chai';

import { object, number, ValidationError, Type } from '../src';

describe('transformation', () => {
  it('works with number -> string in object', () => {
    const numberToString: Type<string> = number.to(n => String(n));
    expect(numberToString.parse(4)).to.equal('4');
    try { numberToString.parse(); } catch (e) { expect(e).to.be.instanceof(ValidationError); }
    const obj = object({ x: numberToString });
    // Vobject({ x: numberToString }); // this must say that type is incompatible
    expect(obj.parse({ x: 4 })).to.deep.equal({ x: '4' });
    try { obj.parse({}); } catch (e) { expect(e).to.be.instanceof(ValidationError); }
  });
});
