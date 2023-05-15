import { ErrorDetail } from '@src/errors/app.errors';
import { CheckFields } from '@src/common/middleware';
import container from '@src/injector';
import { IErrorFactory } from '@src/errors/error.factory';
import { TYPES } from '@src/types';
import { StaticErrors } from '@src/constants';



const checkFields:CheckFields = (type, fields, message, validation)=> {
  return function (req, _res, next) {
    const errorFactory = container.get<IErrorFactory>(TYPES.ErrorFactory);
    let result:ErrorDetail[] = [];
    if (!req[type]) {
      errorFactory.createBadError(message, [{
        message:`Missing ${type} in request`,
        code:1,
      }]);
    }
    
    const data = req[type];

    const missingFields = fields.filter(field => !(data[field]));
    if (missingFields.length > 0) {
      const errors:ErrorDetail[] = missingFields.map(field => ({
        field: field,
        message: StaticErrors.REQUIRED + ' ' + field,
        code:1000,
      })) ;
      result = result.concat(errors);
    } 
    
    if (validation) {
      const validationErrors = validation(data);
      const filteredErrors = Object.keys(validationErrors).filter(field => !missingFields.includes(field));
      if (filteredErrors.length > 0) {
        const errors:ErrorDetail[] = Object.keys(validationErrors).map(field => ({
          field: field,
          message: validationErrors[field] || StaticErrors.INVALID,
          code:1001,
        })) ;
        result = result.concat(errors);
      }
    }

    //quăng lỗi ở đây =.=
    if (result.length > 0) {
      errorFactory.createBadError(message, result);
      // throw new BadRequestError(message, result);
    }
    next();
  };

};
export default checkFields;