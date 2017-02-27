// @flow
/* eslint-env mocha, browser */

// import { expect } from 'chai';

import { arrayOf, string, number, object, instanceOf, Type } from '../src';

describe('readme code', () => {
  it('works', () => {
    // { a: string, b: number, c: Array<string | number | Date>, d: string, e: Date }
    const Schema = object({
      a: string,
      b: number.optional(),
      c: arrayOf(string.or(number).or(instanceOf(Date))),
      d: string.refine((s, error) => { // refinements must return the same type
        if (/el/.test(s)) return s;
        throw error(/el/); // this throws proper error
      }),
      e: string.to(s => new Date(s)) // with .to() you can convert types
    });

    const toBeValidated = {
      a: 'hi',
      c: [1, new Date, '2017'],
      d: 'hello',
      e: 'Mon Feb 27 2017 10:00:15 GMT-0800 (PST)'
    };

    // validate input object, returns original object if valid, throws otherwise
    // WARNING: if .validate() is used with type converters or .to() types,
    // the type will not be right, as validate return original input, meanwhile .to() produces a new object
    Schema.validate(toBeValidated) === toBeValidated; // = true

    // same as validate, but it make a copy in case of: arrayOf, tuple, mapping, object, objectExact
    // it can be used when using refinemnts that return not the original value
    // and with .to() for conversions
    Schema.parse(toBeValidated) === toBeValidated; // = false

    // shortcuts
    Schema.isValid(toBeValidated); // : boolean
    Schema.validateResult(toBeValidated); // : { value: ... } | { error: ... }
    Schema.parseResult(toBeValidated); // : { value: ... } | { error: ... }

    // to get JSON serializable error report
    try { Schema.validate(); } catch (e) { console.log(e.toJSON()); } // eslint-disable-line no-console

    // sometimes flow will not remember types, ex:
    object({ x: number.to(n => new Date(n)) }).parse({ x: 4 }); // unknown type

    // solution
    const x2: Type<Date> = number.to(n => new Date(n));
    object({ x2 }).parse({ x2: 4 }); // : { x: Date }
  });
});
