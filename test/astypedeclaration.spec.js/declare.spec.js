// @flow

import { object, string, number } from "../../src";

export const PersonSchema = object({ name: string, age: number.optional() });

export type PersonType = typeof PersonSchema.type;
