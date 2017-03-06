// @flow

import { Type } from './Type';
import { AsyncType } from '../async/AsyncType';

export type Errors = {[key: string]: ValidationError };
export type ValidationErrorPayload = { expected: Type<any> | AsyncType<any>, got: mixed, errors?: Errors, description?: string };
export type ValidationErrorJSONPayload = {
  expected: { name: string }, description?: string,
  got: any, errors?: {[key: string]: ValidationErrorJSONPayload }
};
export class ValidationError extends Error {
  payload: ValidationErrorPayload;
  constructor(payload: ValidationErrorPayload) { super('ValidationError'); this.payload = payload; }
  toJSON(): ValidationErrorJSONPayload {
    const payload: ValidationErrorJSONPayload = { expected: this.payload.expected.toJSON(), got: this.payload.got };
    if (this.payload.description) payload.description = this.payload.description;
    if (this.payload.errors) {
      const errors = {};
      for (const key of Object.keys(this.payload.errors)) { errors[key] = this.payload.errors[key].toJSON(); }
      payload.errors = errors;
    }
    return payload;
  }
}
