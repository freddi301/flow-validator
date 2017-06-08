// @flow

import { Type } from './Type';
import type { Middleware, $Response, NextFunction } from 'express';

function middleware<T>(validator: Type<T>, fun: (req: T, res: $Response, next: NextFunction) => mixed): Middleware {
  return (req, res, next) => {
    try { const data = validator.parse(req); fun(data, res, next); }
    catch (e) { next(e); }
  };
}

function requestMapping<T>(validator: Type<T>, fun: (req: T, res: $Response) => mixed): Middleware {
    return (req, res, next) => {
    try { const data = validator.parse(req); fun(data, res); }
    catch (e) { next(); }
  };
}

function endpoint<T>(validator: Type<T>, fun: (req: T, res: $Response) => mixed): Middleware {
  return (req, res, next) => {
    try { const data = validator.parse(req); fun(data, res); }
    catch (e) { next(e); }
  };
}

export const express = { endpoint, middleware, requestMapping };