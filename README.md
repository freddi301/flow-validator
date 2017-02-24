# flow-validator

Object validation with proper flow types.

## Usage

```javascript
import { arrayOf, string, number, instanceof, union, object } from 'flow-validator'

arrayOf(union(string, instanceOf(Date))).validate([1, new Date, '10/2'])

string.refine(s => { if (/el/.test(s)) return s; throw new Error(); }).validate('hello')

object({ a: string, b: number }).validate({}) // throws error
```

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

# TODO

- [ ] npm package
- [ ] test coverage
