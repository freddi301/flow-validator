// @flow
/* eslint-env mocha, browser */

// import { expect } from 'chai';

import { arrayOf, string, number, object, instanceOf, Type, Vobject, asyncArrayOf, tuple, takes } from '../src';

describe('readme code', () => {
  it('works', () => {

    // { name: string, age: ?number, toys: Array<string> }
    const Person = object({ name: string, age: number.optional(), toys: arrayOf(string) });
    const fred = Person.parse({ name: 'Fred', age: 89, toys: ['teddy bear', 'shotgun'] });
    console.log(fred); // eslint-disable-line no-console

    // Array<string> validated asynchronously
    const InventoryObjects = asyncArrayOf(string.async().refine(checkInventory));
    const shoppingCart = InventoryObjects.parse(['AK47', 'stuffed bunny']);
    shoppingCart.then(items => console.log(items)); // eslint-disable-line no-console

    async function checkInventory(item: string, error): Promise<string> {
      if (~['AK47', 'stuffed bunny'].indexOf(item)) return item;
      return Promise.reject(error('no supplies'));
    }

    const Contact = object({ name: string, birth: string.toDate(), email: string.isEmail().optional() });
    console.log(Contact.parse({ name: 'fred', birth: String(new Date), email: 'gobi301@gmail.com' })); // eslint-disable-line no-console

    // ensure functions params, useful on user input functions
    const signUpUser = takes(string.isEmail(), number)((email, secretCoupon) => `user ${email} added with coupon: ${secretCoupon}`);
    signUpUser('gobi301@gmail.com', 666);

    // Don't Repeat Yourself
    // you can use a type of a defined schema, instead of
    // var yogi: { name: string, age: ?number, toys: Array<string> }
    var yogi: typeof Person.type; // eslint-disable-line no-unused-vars

    // runtime introspection
    const Name: Type<string> = Person.schema.name; // eslint-disable-line no-unused-vars
    const Age: Type<?number> = Person.schema.age; // eslint-disable-line no-unused-vars

    // const tup: [string, number, Date] = ...
    const tup = tuple([string, number, instanceOf(Date)]).parse(['hello', 4, new Date]);  // eslint-disable-line no-unused-vars

    // { a: string, b: number, c: Array<string | number | Date>, d: string, e: Date }
    const Schema = object({
      a: string,
      b: number.optional(),
      c: arrayOf(string.or(number).or(instanceOf(Date))),
      d: string.refine((s, error) => { // refinements must return the same type
        if (/el/.test(s)) return s;
        throw error(String(/el/)); // this throws proper error
      }).revalidate(), // add a revalidate if want to be sure not changed type during refinement
      e: string.to(s => new Date(s)) // with .to() you can convert types
    });

    const toBeValidated = {
      a: 'hi',
      c: [1, new Date, '2017'],
      d: 'hello',
      e: 'Mon Feb 27 2017 10:00:15 GMT-0800 (PST)'
    };

    // validate input object, returns original object if valid, throws otherwise
    // VType object has .validate() method that returns original object
    // arrayOf, tuple, mapping, object, objectExact ha V prefixed variants,
    // and can't contain validators that change input
    Vobject({ a: string }).validate({ a: 'hello' }) === toBeValidated; // = true

    // same as validate, but it make a copy in case of: arrayOf, tuple, mapping, object, objectExact
    // it can be used when using refinemnts that return not the original value
    // and with .to() for conversions
    Schema.parse(toBeValidated) === toBeValidated; // = false
    // deepEqual(Schema.parse(toBeValidated), toBeValidated); // = true

    // shortcuts
    Vobject({ a: string }).isValid({ a: 'hello' }); // : boolean
    Vobject({ a: string }).validateResult({ a: 'hello' }); // : { value: ... } | { error: ... }
    Schema.parseResult(toBeValidated); // : { value: ... } | { error: ... }

    // you can chain validators, to reuse them or check if your custom type converter works
    string.to(s => new Date(s)).chain(instanceOf(Date));

    // to get JSON serializable error report
    try { Schema.parse(); } catch (e) { console.log(e.toJSON()); } // eslint-disable-line no-console

    // sometimes flow will not remember types, ex:
    object({ x: number.to(n => new Date(n)) }).parse({ x: 4 }); // unknown type

    // solution
    const x2: Type<Date> = number.to(n => new Date(n));
    object({ x2 }).parse({ x2: 4 }); // : { x: Date }

    // type-safe composition
    const str2num = (s: string) => Number(s);
    const div = (n: number) => n / 2;
    const num2str = (n: number) => String(n);
    const str2arr = (s: string) => s.split('1');
    const nonSense = string.compose(str2num).compose(div).compose(num2str).compose(str2arr);
    nonSense.parseResult('1234567890'); // : Array<string>

    // you can convert sync type to async one
    string.async();
  });
});
