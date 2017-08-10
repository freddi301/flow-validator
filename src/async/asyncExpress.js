// @flow

import { AsyncType } from "./AsyncType";
import type { Middleware, $Response, NextFunction } from "express";

function middleware<T>(
  validator: AsyncType<T>,
  fun: (req: T, res: $Response, next: NextFunction) => mixed
): Middleware {
  return (req, res, next) =>
    validator.parse(req).then(data => fun(data, res, next), next);
}

function requestMapping<T>(
  validator: AsyncType<T>,
  fun: (req: T, res: $Response) => mixed
): Middleware {
  return (req, res, next) =>
    validator.parse(req).then(data => fun(data, res), () => next());
}

function endpoint<T>(
  validator: AsyncType<T>,
  fun: (req: T, res: $Response) => mixed
): Middleware {
  return (req, res, next) =>
    validator.parse(req).then(data => fun(data, res), next);
}

export const asyncExpress = { endpoint, middleware, requestMapping };
