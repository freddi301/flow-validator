[![Build Status](https://travis-ci.org/freddi301/flow-validator.svg?branch=master)](https://travis-ci.org/freddi301/flow-validator)
[![davidDm Dependencies](https://david-dm.org/freddi301/flow-validator.svg)]()
[![Known Vulnerabilities](https://snyk.io/test/github/freddi301/flow-validator/badge.svg)](https://snyk.io/test/github/freddi301/flow-validator)
[![Coverage Status](https://coveralls.io/repos/github/freddi301/flow-validator/badge.svg?branch=master)](https://coveralls.io/github/freddi301/flow-validator?branch=master)
[![Inline docs](http://inch-ci.org/github/freddi301/flow-validator.svg?branch=master)](http://inch-ci.org/github/freddi301/flow-validator)
![repo size](https://reposs.herokuapp.com/?path=freddi301/flow-validator)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)

# flow-validator

Object validation with proper flow types.

## Installation

```npm install flow-validator```


## Usage

```javascript
import { arrayOf, string, number, instanceof, object, Type } from 'flow-validator';

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
})

const toBeValidated = {
  a: 'hi'.
  c: [1, new Date, '2017'],
  d: 'hello',
  e: 'Mon Feb 27 2017 10:00:15 GMT-0800 (PST)'
}

// validate input object, returns original object if valid, throws otherwise
// WARNING: if .validate() is used with type converters or .to() types,
// the type will not be right, as validate return original input, meanwhile .to() produces a new object
Schema.validate(toBeValidated) === toBeValidated // = true

// same as validate, but it make a copy in case of: arrayOf, tuple, mapping, object, objectExact
// it can be used when using refinemnts that return not the original value
// and with .to() for conversions
Schema.parse(toBeValidated) === toBeValidated // = false

// shortcuts
Schema.isValid(toBeValidated) // : boolean
Schema.validateResult(toBeValidated) // : { value: ... } | { error: ... }
Schema.parseResult(toBeValidated) // : { value: ... } | { error: ... }

// to get JSON error report
try { Schema.validate() } catch (e) { console.log(e.toJSON()); }

```

for use outside of babel environment ```require('/node_modules/flow-validator/flow-validator.js')```

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

# Technical documentation

```
git clone https://github.com/freddi301/flow-validator.git
cd flow-validator
yarn
npm run doc:serve
```

# Feature Requests Wanted
(open issue, include examples or links)

# Work around for Flow bugs

```javascript
// sometimes flow will not remember types, ex:
const x = object({ x: number.to(n => new Date(n)) }).parse() // unknown type

// solution
const x: Type<Date> = number.to(n => new Date(n));
const y = object({ x }).parse(); // : { x: Date }
```

# TODO

- [ ] literal values
- [ ] fix validate/parse [.refine() has validate+parse] [.to() has parse]
- [ ] common controls
- [ ] .validateAsync() .parseAsync() promise
- [ ] generate documentation from types (md, html, jsonschema)
- [ ] include https://github.com/hapijs/joi/blob/master/API.md features
- [ ] doc examples for all
- [ ] test 100%
- [ ] doc 100%
- [ ] better flow coverage where possible
- [ ] json schema validation
- [ ] performance comparison
- [ ] optimize, use lodash, cache optional() singleton and frequently used types
- [ ] .refine().revalidate() .to().revalidate() revalidate after trasformation

---

[![npm version](https://badge.fury.io/js/flow-validator.svg)](https://badge.fury.io/js/flow-validator)
[![Code Climate](https://codeclimate.com/github/freddi301/flow-validator/badges/gpa.svg)](https://codeclimate.com/github/freddi301/flow-validator)
[![NSP Status](https://nodesecurity.io/orgs/frederik-batuna/projects/f9a6e9b9-c6d8-4cfb-84c0-548310794dcb/badge)](https://nodesecurity.io/orgs/frederik-batuna/projects/f9a6e9b9-c6d8-4cfb-84c0-548310794dcb)

[![bitHound Overall Score](https://www.bithound.io/github/freddi301/flow-validator/badges/score.svg)](https://www.bithound.io/github/freddi301/flow-validator)
[![bitHound Code](https://www.bithound.io/github/freddi301/flow-validator/badges/code.svg)](https://www.bithound.io/github/freddi301/flow-validator)
[![bitHound Dependencies](https://www.bithound.io/github/freddi301/flow-validator/badges/dependencies.svg)](https://www.bithound.io/github/freddi301/flow-validator/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/freddi301/flow-validator/badges/devDependencies.svg)](https://www.bithound.io/github/freddi301/flow-validator/master/dependencies/npm)

[![NPM](https://nodei.co/npm/flow-validator.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/flow-validator/)
