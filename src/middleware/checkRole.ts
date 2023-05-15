import { CheckRole } from '@src/common/middleware';
import { IErrorFactory } from '@src/errors/error.factory';
import container from '@src/injector';
import { TYPES } from '@src/types';



const checkRole:CheckRole = (roles) => {

  return function (_req, res, next) {
    const errorFactory = container.get<IErrorFactory>(TYPES.ErrorFactory);
    //Get the user from previous midleware
    const currentUser = res.locals.user;


    //Check if array of authorized roles includes the user's role
    if (roles.indexOf(currentUser.role) > -1)  next();
    else errorFactory.createUnUnauthorizedError('Bạn không có role');
  };
};
export default checkRole;