// @flow

import type { PersonType } from "./declare.spec";

export var duffy: PersonType = { name: "duffy", age: null };
(duffy: { name: string, age: ?number });
// $ExpectError
(duffy: { name: string, age: number });
