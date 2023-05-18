import { injectable } from 'inversify';
import { ErrorDetail, BadRequestError, UnauthorizedError } from './app.errors';
import { StaticErrors } from '@src/constants';



export interface IErrorFactory {
  createBadError(message:string, errors?: ErrorDetail[]): never;
  createUnUnauthorizedError(message:string):never;
  createRepositoryError(message:string, errors?: ErrorDetail[]):never;
  createNotFoundError(message:string, errors?:ErrorDetail[]):never;
  createDuplicateError(message:string, errors?:ErrorDetail[]):never;
  createMissingError(message:string, fields:string[]):never;
}

@injectable()
export class ErrorFactory implements IErrorFactory {
  createMissingError(message: string, fields:string[]): never {
    throw new BadRequestError(message, fields.map((field=>({
      field:field,
      message: StaticErrors.REQUIRED + ' ' + field,
      code:1000,
    }))));
  }

  createDuplicateError(message: string, errors?: ErrorDetail[]): never {
    throw new BadRequestError(message, errors || [{
      message: StaticErrors.DUPLICATE,
      code:1002,
    }]);
  }

  createNotFoundError(message: string, errors?: ErrorDetail[]): never {
    throw new BadRequestError(message, errors || [{
      message: StaticErrors.NOT_FOUND,
      code:1003,
    }]);
  }

  createRepositoryError(message: string, errors?: ErrorDetail[]): never {
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