import { StaticStringKeys } from '../constants';
export interface ErrorDetail {
  field?: string;
  message?: string;
  code?:number
}
export class ApplicationError extends Error {
  public code = null;

  public errors: ErrorDetail[];

  constructor(code: number, message: string, errors?: ErrorDetail[], ...args: any) {
    super(...args);
    this.code = code;
    this.message = message;
    this.errors = errors;
  }
}

export class BadRequestError extends ApplicationError {
  constructor(message: string, errors?: ErrorDetail[], ...args: any) {
    super(400, message, errors, ...args);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message?: string, errors?: ErrorDetail[]) {
    super(401, message, errors);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message?: string, ...args: any) {
    super(403, message, args);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message?: string) {
    super(404, message, null, arguments);
  }
}

export class MethodNotAllowedResponse extends ApplicationError {
  constructor(message?: string) {
    super(405, message, null, arguments);
  }
}

export class MissingFieldError extends BadRequestError {
  constructor(  message?: string, errors?: ErrorDetail[], ...args: any) {
    // super(`${fieldName} is required`, args);
    super(message || 'One or more fields are missing', args);
    this.errors = errors;
  }
}

export class InternalError extends ApplicationError {
  constructor(message?: string) {
    super(500, message, null, arguments);
  }
}

export class InvalidCredentialError extends BadRequestError {
  constructor(...args: any) {
    super(StaticStringKeys.INVALID_CREDENTIAL, args);
  }
}

export class InvalidTokenError extends BadRequestError {
  constructor(type: string, ...args: any) {
    if (type === 'ACCESS') {
      super(StaticStringKeys.INVALID_ACCESS_TOKEN, args);
    } else {
      super(StaticStringKeys.INVALID_REFRESH_TOKEN, args);
    }
  }
}

export class InvalidIdError extends BadRequestError {
  constructor(...args: any) {
    super(StaticStringKeys.REPOSITORY_ERROR_INVALID_ID, args);
  }
}
export class InvalidDateError extends BadRequestError {
  constructor(...args: any) {
    super(StaticStringKeys.REPOSITORY_ERROR_INVALID_DATE, args);
  }
}

export class RepositoryMissingField extends BadRequestError {
  constructor(...args: any) {
    super('Field missing', args);
  }
}


