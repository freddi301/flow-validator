[![Build Status](https://travis-ci.org/freddi301/flow-validator.svg?branch=master)](https://travis-ci.org/freddi301/flow-validator)

# flow-validator

## Installation

```npm install flow-validator```

Object validation with proper flow types.

## Usage

```javascript
import {
  arrayOf, string, number,
  instanceof, union, object,
  ValidationError
} from 'flow-validator'

// Array<string | Date>
const Dates = arrayOf(union(string, instanceOf(Date)));
const validDates = Dates.validate([1, new Date, '10/2']); // throws

const RefinedString = string.refine((s, error) => {
  if (/el/.test(s)) return s;
  throw error(/el/); // this throws proper error
});
const validRefinedString = RefinedString.validate('hello');

// { a: string, b: number }
object({ a: string, b: number }).validate({}) // throws error

// fluent syntax
// number | string | boolean
string.or(number).or(boolean)

// Array<?string>
arrayOf(string.optional())

// to get JSON error report
try { string.validate() } catch (e) { console.log(e.toJSON()); }
```

for use outside of babel environment ```require('/node_modules/flow-validator/build/index.js')```

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
| function | `(a: A) => B` | ✘ |

# Feature Requests Wanted
(open issue, include examples or links)

# TODO

- [ ] test coverage
- [ ] travis
- [ ] promise
- [ ] literal values
- [ ] fluent syntax
- [ ] exact
- [ ] tuple
- [ ] common controls
- [ ] performance comparison
- [ ] include https://github.com/gcanti/flow-io features
- [ ] include https://github.com/andreypopp/validated features
- [ ] include https://github.com/hapijs/joi features
