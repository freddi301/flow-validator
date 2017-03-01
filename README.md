[![Build Status](https://travis-ci.org/freddi301/flow-validator.svg?branch=master)](https://travis-ci.org/freddi301/flow-validator)
[![davidDm Dependencies](https://david-dm.org/freddi301/flow-validator.svg)]()
[![Known Vulnerabilities](https://snyk.io/test/github/freddi301/flow-validator/badge.svg)](https://snyk.io/test/github/freddi301/flow-validator)
[![Coverage Status](https://coveralls.io/repos/github/freddi301/flow-validator/badge.svg?branch=master)](https://coveralls.io/github/freddi301/flow-validator?branch=master)
[![Inline docs](http://inch-ci.org/github/freddi301/flow-validator.svg?branch=master)](http://inch-ci.org/github/freddi301/flow-validator)
![repo size](https://reposs.herokuapp.com/?path=freddi301/flow-validator)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/freddi301/flow-validator/issues)

# flow-validator

Object validation with proper flow types.

## Installation

```npm install flow-validator```


## Usage

```javascript
import { arrayOf, string, number, object, instanceOf, Type, Vobject } from 'flow-validator';

// { a: string, b: number, c: Array<string | number | Date>, d: string, e: Date }
const Schema = object({
  a: string,
  b: number.optional(),
  c: arrayOf(string.or(number).or(instanceOf(Date))),
  d: string.refine((s, error) => { // refinements must return the same type
    if (/el/.test(s)) return s;
    throw error(/el/); // this throws proper error
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
```

for use outside of babel environment ```require('/node_modules/flow-validator/flow-validator.js')```

for minified version ```require('/node_modules/flow-validator/flow-validator.min.js')```

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
| function | `(a: A) => B` | ✘ |

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

# TODO

- [ ] add sync versions of (arrayOf, tuple, mapping, object, objectExact) -> minor release
- [ ] readme += async validators
- [ ] readme += alternate use: json graphql alternative
- [ ] common controls
- [ ] include https://github.com/hapijs/joi/blob/master/API.md features -> minor release
- [ ] generate documentation from types (md, html, jsonschema, blueprint, mson) -> release
- [ ] doc examples for all
- [ ] test 100% -> major release
- [ ] doc 100%
- [ ] better flow coverage where possible
- [ ] json schema validation
- [ ] performance comparison
- [ ] optimize, use lodash, cache optional() singleton and frequently used types
- [ ] readme += new type example
- [ ] literal values

---

[![npm version](https://badge.fury.io/js/flow-validator.svg)](https://badge.fury.io/js/flow-validator)
[![Code Climate](https://codeclimate.com/github/freddi301/flow-validator/badges/gpa.svg)](https://codeclimate.com/github/freddi301/flow-validator)
[![NSP Status](https://nodesecurity.io/orgs/frederik-batuna/projects/f9a6e9b9-c6d8-4cfb-84c0-548310794dcb/badge)](https://nodesecurity.io/orgs/frederik-batuna/projects/f9a6e9b9-c6d8-4cfb-84c0-548310794dcb)

[![bitHound Overall Score](https://www.bithound.io/github/freddi301/flow-validator/badges/score.svg)](https://www.bithound.io/github/freddi301/flow-validator)
[![bitHound Code](https://www.bithound.io/github/freddi301/flow-validator/badges/code.svg)](https://www.bithound.io/github/freddi301/flow-validator)
[![bitHound Dependencies](https://www.bithound.io/github/freddi301/flow-validator/badges/dependencies.svg)](https://www.bithound.io/github/freddi301/flow-validator/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/freddi301/flow-validator/badges/devDependencies.svg)](https://www.bithound.io/github/freddi301/flow-validator/master/dependencies/npm)

[![NPM](https://nodei.co/npm/flow-validator.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/flow-validator/)
