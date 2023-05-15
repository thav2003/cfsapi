import { injectable } from 'inversify';
import { ErrorDetail, BadRequestError, UnauthorizedError } from './app.errors';
import { StaticErrors } from '@src/constants';



export interface IErrorFactory {
  createBadError(message:string, errors?: ErrorDetail[]): never;
  createUnUnauthorizedError(message:string):never;
  createMongoDbError(message:string, errors?: ErrorDetail[]):never;
}

@injectable()
export class ErrorFactory implements IErrorFactory {
  createMongoDbError(message: string, errors?: ErrorDetail[]): never {
    throw new BadRequestError(message, errors || [{
      message: StaticErrors.REPO_ERROR,
      code:5000,
    }]);
  }

  createUnUnauthorizedError(message?: string): never {
    throw new UnauthorizedError(message, [{
      message: StaticErrors.UnauthorizedError,
      code:3000,
    }]);
  }

  createBadError(message: string, errors?: ErrorDetail[]): never {
    throw new BadRequestError(message, errors || [{
      message: StaticErrors.BadRequestError,
      code:1,
    }]);
  }
  
}