// @flow
/* eslint-env mocha */

import { expect } from 'chai';

import { string } from '../../src';

describe('Type', () => {
  describe('.default()', () => {
    // $ExpectError
    string.default(5);
    const defaultType = string.default('hello');
    it('yields the default value if undefined or null supplied', () => {
      expect(defaultType.parse()).to.equal('hello');
      expect(defaultType.parse(undefined)).to.equal('hello');
      expect(defaultType.parse(null)).to.equal('hello');
    });
    it('yields the validated value if valid', () => {
      expect(defaultType.parse('bye')).to.equal('bye');
    });
  });
  describe('.force()', () => {
    const forcedType = string.force('hello');
    it('yields default value if any validation error is thrown', () => {
      expect(forcedType.parse()).to.equal('hello');
      expect(forcedType.parse(undefined)).to.equal('hello');
      expect(forcedType.parse(null)).to.equal('hello');
      expect(forcedType.parse('bye')).to.equal('bye');
      expect(forcedType.parse(89)).to.equal('hello');
      expect(forcedType.parse({})).to.equal('hello');
    });
  });
});