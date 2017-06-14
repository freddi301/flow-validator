[![npm version](https://badge.fury.io/js/flow-validator.svg)](https://badge.fury.io/js/flow-validator)
[![Build Status](https://travis-ci.org/freddi301/flow-validator.svg?branch=master)](https://travis-ci.org/freddi301/flow-validator)
[![davidDm Dependencies](https://david-dm.org/freddi301/flow-validator.svg)]()
[![Known Vulnerabilities](https://snyk.io/test/github/freddi301/flow-validator/badge.svg)](https://snyk.io/test/github/freddi301/flow-validator)
[![Coverage Status](https://coveralls.io/repos/github/freddi301/flow-validator/badge.svg?branch=master)](https://coveralls.io/github/freddi301/flow-validator?branch=master)
[![Inline docs](https://inch-ci.org/github/freddi301/flow-validator.svg?branch=master)](httpsss://inch-ci.org/github/freddi301/flow-validator)
[![npm downloads](https://img.shields.io/npm/dm/flow-validator.svg?style=flat-square)](https://www.npmjs.com/package/flow-validator)
![Licence](https://img.shields.io/npm/l/flow-validator.svg?label=licence)
![Stability: Stable](https://img.shields.io/badge/stability-alpha-blue.svg)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/freddi301/flow-validator/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

# flow-validator

Object validation with proper flow types and more.

## Installation

```npm install flow-validator```

## Usage

```javascript
import { arrayOf, string, number, object, instanceOf, Type, Vobject, asyncArrayOf, tuple, takes, match } from 'flow-validator';
import { express } from 'flow-validator/express';

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

// pattern matching
const x = match(1,
  number, n => new Date(n*2),
  Person, ({ name }) => [name, name]
);
(x: Date);

// express middleware example
const middleware = express.middleware(object({ headers: object({ 'my-custom-header': string }) }), (req, res, next) => next());

// express endpoint matching middleware (inspired to Spring RequestMapping)
const requestMap1 = express.requestMapping(object({ body: Person }), (req, res) => res.json(req.body.age));
const requestMap2 = express.requestMapping(object({ body: object({ username: string, password: string }) }), (req, res) => {/* authenticate */});
// app.use('/user', requestMap1);
// app.use('/user', requestMap2);

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
```

if you do not want import the entire library, you can find single validators in
```import { object } from 'flow-validator/sync/object';```
or
```import { asyncArrayOf } from 'flow-validator/async/asyncArrayOf';```

for minified version ```require('/node_modules/flow-validator/lib/flow-validator.min.js')```

# Implemented types / combinators

| Type | Flow syntax | Runtime type |
|------|-------|-------------|
| string | `string` | `string` |
| number | `number` | `number` |
| boolean | `boolean` | `boolean` |
| generic object | `Object` | `objectType` |
| generic function | `Function` | `Function` |
| instance of `C` | `C` | `instanceOf(C)` |
| class of `C` | `Class<C>` | `classOf(C)` |
| array | `Array<A>` | `arrayOf(A)` |
| intersection | `A & B` | `intersection(A, B)` |
| union | `A | B` | `union(A, B)` |
| literal | `'s'` | `literal('s')` |
| optional | `?A` | `optional(A)` |
| map | `{ [key: A]: B }` | `mapping(A, B)` |
| refinement | ✘ | `number.refine(n => { if (n > 10) return n; throw new Error(); })` |
| object | `{ name: string }` | `object({ name: string })` |
| exact object | `{| name: string |}` | `objectExact({ name: string })` |
| null | `null` | `isNull` |
| undefined | `void` | `isUndefined` |
| not checked | `any` | `isAny` |
| all types | `mixed` | `isMixed` |
| function | `(a: A) => B` | `takes(A)(returns(B)(...))` |

# Included refinements

| Type | Refinements | Transformations |
|------|-------------|-----------------|
| string | `.isEmail() .isValidDate() .minLength() .maxLength() .regexp()` | `.toDate()`

# [Technical documentation](https://freddi301.github.io/flow-validator/doc)

for older versions:
```
git clone https://github.com/freddi301/flow-validator.git
cd flow-validator
yarn
npm run doc:serve
```

# Feature Requests Wanted
(open issue, include examples or links)

## Inspiration

[flow-io](https://github.com/gcanti/flow-io) (checkout [io-ts](https://github.com/gcanti/io-ts) too)

## Alternatives
- [flow-io](https://github.com/gcanti/flow-io)
- [validated](https://github.com/andreypopp/validated)

## Alternatives - not flow typed
- [joi](https://github.com/hapijs/joi)

# Planned Features

- [ ] 0.6.0
  - asyncTakes() asyncVtakes()
  - [x] returns() Vreturns()
  - asyncReturns() asyncVreturns()
  - readme += alternate use: json graphql alternative
  - Vmatch asyncMatch asyncVmatch
  - overloading
  - monad do notation using row polymorphism
  - auto row currying (aka builder)
- [ ] 0.7.0
  - include https://github.com/hapijs/joi/blob/master/API.md features
  - typescript support
- [ ] 0.8.0
  - generate documentation from types (md, html, jsonschema, blueprint, mson, graphql-schema)
  - generate flow-validator validators from flow annotations, jsonschema and graphql-schema (cli, runtime, compiletime, startuptime)
  - json schema validation
- [ ] 0.9.0
  - refactor validators to contain metadata
  - refactor errors to contain metadata
  - write visitors for validators and errors
  - write default interpreters for errors json and optionally localized text
- [ ] 1.0.0
  - test 100%
  - doc examples for all validators
  - better flow coverage where possible
  - readme += new type example
- [ ] 2.0.0
  - doc 100%
  - performance comparison
  - optimize, use lodash, cache optional() singleton and frequently used types
  - literal values

### Other

- move documentation to surge.sh

---

[![Code Climate](https://codeclimate.com/github/freddi301/flow-validator/badges/gpa.svg)](https://codeclimate.com/github/freddi301/flow-validator)
[![Test Coverage](https://codeclimate.com/github/freddi301/flow-validator/badges/coverage.svg)](https://codeclimate.com/github/freddi301/flow-validator/coverage)
[![Issue Count](https://codeclimate.com/github/freddi301/flow-validator/badges/issue_count.svg)](https://codeclimate.com/github/freddi301/flow-validator)

[![bitHound Overall Score](https://www.bithound.io/github/freddi301/flow-validator/badges/score.svg)](https://www.bithound.io/github/freddi301/flow-validator)
[![bitHound Code](https://www.bithound.io/github/freddi301/flow-validator/badges/code.svg)](https://www.bithound.io/github/freddi301/flow-validator)
[![bitHound Dependencies](https://www.bithound.io/github/freddi301/flow-validator/badges/dependencies.svg)](https://www.bithound.io/github/freddi301/flow-validator/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/freddi301/flow-validator/badges/devDependencies.svg)](https://www.bithound.io/github/freddi301/flow-validator/master/dependencies/npm)

[![NSP Status](https://nodesecurity.io/orgs/frederik-batuna/projects/f9a6e9b9-c6d8-4cfb-84c0-548310794dcb/badge)](https://nodesecurity.io/orgs/frederik-batuna/projects/f9a6e9b9-c6d8-4cfb-84c0-548310794dcb)
![repo size](https://reposs.herokuapp.com/?path=freddi301/flow-validator)

[![NPM](https://nodei.co/npm/flow-validator.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/flow-validator/)
