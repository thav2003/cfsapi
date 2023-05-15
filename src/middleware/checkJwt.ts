import { IRepository } from '@core/repository/IRepository';
import { User } from '@models';
import { getValidObjectId } from '@utils/utils';
import container from '@src/injector';
import { TYPES } from '@src/types';
import { JsonWebTokenError, JwtPayload, NotBeforeError, TokenExpiredError, verify } from 'jsonwebtoken';
import { CheckJwt } from '@src/common/middleware';
import { IErrorFactory } from '@src/errors/error.factory';



const checkJwt:CheckJwt = async (req, res, next) =>{
  const errorFactory = container.get<IErrorFactory>(TYPES.ErrorFactory);
  // 1) Getting token and check of it's there
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) errorFactory.createUnUnauthorizedError('Không có JWT');  

  // 2) Verification token
  let decoded:JwtPayload;
  try {
    decoded = verify(token, process.env.JWT_SECRET) as JwtPayload;
  } catch (e) {
    if (e instanceof JsonWebTokenError) {
      // Xử lý lỗi chung xác minh token
      errorFactory.createUnUnauthorizedError('Secrect key is wrong !!!');
    } else if (e instanceof NotBeforeError) {
      // Xử lý lỗi khi token chưa đến thời điểm sử dụng
    } else if (e instanceof TokenExpiredError) {
      // Xử lý lỗi khi token đã hết hạn
      errorFactory.createUnUnauthorizedError('Token xác thực đã quá hạn !!!');
    } 
  }

  // 3) Check if user still exists
  const userRepository = container.get<IRepository<User>>(TYPES.UserRepositoryProxy);

  let user: User;
  user = await userRepository.get(getValidObjectId(decoded.userId));
  if (!user) {
    errorFactory.createUnUnauthorizedError('Không tìm thấy user');
  }
       
  // GRANT ACCESS TO PROTECTED ROUTE
  res.locals.user = user;
  next();
};

export default checkJwt;