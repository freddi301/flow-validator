// @flow
/* eslint-env mocha */

import { expect } from 'chai';

import { string, ValidationError } from '../../src';

describe('string', () => {
  describe('#parse', () => {
    it('returns on expected type', () => {
      expect(string.parse('hello')).to.equal('hello');
    });
    it('throws on wrong type', () => {
      const errorShape = got => ({ expected: { name: string.name }, got });
      try { string.parse(); } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal(errorShape(void 0));
      }
      const date = new Date;
      try { string.parse(date); } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal(errorShape(date));
      }
    });
  });
  describe('#validate', () => {
    it('returns on expected type', () => {
      expect(string.validate('hello')).to.equal('hello');
    });
    it('throws on wrong type', () => {
      const errorShape = got => ({ expected: { name: string.name }, got });
      try { string.validate(); } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal(errorShape(void 0));
      }
      const date = new Date;
      try { string.validate(date); } catch (e) {
        expect(e).to.be.instanceof(ValidationError);
        expect(e.toJSON()).deep.equal(errorShape(date));
      }
    });
  });
});
