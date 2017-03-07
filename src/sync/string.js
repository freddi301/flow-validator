// @flow

import { ValidationError } from './ValidationError';
import { Type } from './Type';
import { VType } from './VType';

export class StringType extends VType<string> {
  constructor(parse: (value: mixed) => string) {
    super('string', parse);
  }
  isValidDate(): StringType {
    const dt = new StringType(v => {
      const s = string.parse(v);
      const date: Date = new Date(s);
      if ( Object.prototype.toString.call(date) === "[object Date]") {
        if ( isNaN( date.getTime() ) ) { throw new ValidationError({ expected: dt, got: v }); }
        else { return s; }
      } else { throw new ValidationError({ expected: dt, got: v, description: 'invalid date' }); }
    });
    return dt;
  }
  toDate(): Type<Date> {
    const dt = new Type('date', v => {
      const s = string.parse(v);
      const date: Date = new Date(s);
      if ( Object.prototype.toString.call(date) === "[object Date]") {
        if ( isNaN( date.getTime() ) ) { throw new ValidationError({ expected: dt, got: v }); }
        else { return date; }
      } else { throw new ValidationError({ expected: dt, got: v, description: 'invalid date' }); }
    });
    return dt;
  }
  isEmail(): StringType {
    const em = new StringType(v => {
      const s = string.validate(v);
      const isEmail = (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(s);
      if (isEmail) return s;
      throw new ValidationError({ expected: em, got: v, description: 'invalid email' });
    });
    return em;
  }
}

export const string: StringType = new StringType(v => {
  if (typeof v === 'string') return v;
  throw new ValidationError({ expected: string, got: v });
});
