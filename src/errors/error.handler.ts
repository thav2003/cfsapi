import { Application, Request as ExpressRequest, NextFunction } from 'express';
import { NotFoundError, ApplicationError } from './app.errors';
import { MongoError } from 'mongodb';
import log from '../logger';
import { CustomResponse } from '@src/common/common';

export default function (app: Application) {

  /**
   * Handle errors
   */

  // If you are lost
  app.use(() => {
    throw new NotFoundError('The api not exists');
  });

  // Request error handler
  app.use((err: ApplicationError, _req: ExpressRequest, res: CustomResponse, next: NextFunction) => {
    if (err instanceof ApplicationError) {
      if (err.message) {
        log.info(err.message);
        return res.sendError(err.code, err.message, err.errors);
      } else {
        return res.sendError(err.code, 'Some thing went wrong !!!', null);
      }
    }

    next(err);
  });

  // Log all errors
  app.use(function (err: any, req: ExpressRequest, res: CustomResponse, next: NextFunction) {
    const userString = 'unknown user';

    if (err instanceof MongoError) {
      if (err.code === 11000) {
        log.error(`${req.method} ${req.path}: MongoDB duplicate entry from ${userString}`);
      } else {
        log.error(`${req.method} ${req.path}: Unhandled MongoDB error ${userString}. ${err.errmsg}`);
      }

      if (!res.headersSent) {
        return res.sendError(500, 'MongoDB something wrong !!!', null);
      }

    } else if (err instanceof Error) {
      log.error(`${req.method} ${req.path}: Unhandled request error ${userString}. ${err.message}`);
    } else if (typeof err === 'string') {
      log.error(`${req.method} ${req.path}: Unhandled request error ${userString}. ${err}`);
    }

    next(err);
  });

  // Optional fallthrough error handler
  app.use(function onError(err: Error, _req: ExpressRequest, res: CustomResponse, _next: NextFunction) {
    // res.statusCode = 500;
    // res.end(err.message + '\n');
    return res.sendError(500, err.message, null);
  });
}