import {  inject, injectable } from 'inversify';
import * as bcrypt from 'bcrypt';
import { TYPES } from '@src/types';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken, User } from '@models';
import { GetUserLoginDTO, RegistrationDTO } from '@dto/authDTO';
import container from '@src/injector';
import { IAuthService, IRefreshTokenService, IUserService, Login, LoginStrategy, Register, RegisterStrategy } from '@services/Interface';
import { ObjectId } from 'mongodb';
import { NormalizedUser } from '@utils/normalize';
import { IRepository } from '@core/repository/IRepository';
import { Select } from '@core/repository/ISelect';
import { StaticErrors, StaticMessage } from '@src/constants';
import logger from '@src/logger';
import Email from '@utils/email';
import { getValidDate } from '@utils/utils';
import {  IErrorFactory } from '@src/errors/error.factory';


//[ ] Implement FacebookRegisterStrategy
export class FacebookRegisterStrategy implements RegisterStrategy {
  async register(_data: RegistrationDTO): Promise<User> {
    // Code để đăng ký người dùng sử dụng tài khoản Facebook.
    throw new Error('Method not implemented.');
  }
}


//[x] Implement EmailRegisterStrategy
export class EmailRegisterStrategy  implements RegisterStrategy {
  async register(data: RegistrationDTO): Promise<User> {
    logger.debug('Email Register Strategy is runnning ...');
    const errorFactory = container.get<IErrorFactory>(TYPES.ErrorFactory);

    // Code để đăng ký người dùng sử dụng tài khoản Email.
    const userRepositoryProxy = container.get<IRepository<User>>(TYPES.UserRepositoryProxy);
    const find = await userRepositoryProxy.findOne({ email:data.email });
    if (find) {
      if (!find.active) {
        const token = this.signToken(find._id);
        const url = `http://localhost:3334/api/v1/auth/verify/${find._id}/${token}`;
    
        new Email(find).sendVerify(url);
        return;
      }
      errorFactory.createBadError(StaticMessage.REGISTER_FAILD, [{
        field: 'email',
        message: StaticErrors.DUPLICATE,
        code:1002,
      }]);
    }
    const hashPassword = await this.hashPassword(data.password);
    const user = {
      name: data.name,
      email: data.email,
      password: hashPassword,
      role: data.role,
      status:0,
      active:false,
    } as User;
    const created = await userRepositoryProxy.create(user);
    const token = this.signToken(user._id);
    const url = `http://localhost:3334/api/v1/auth/verify/${created._id}/${token}`;

    new Email(user).sendVerify(url);
    logger.debug('Email Register Strategy is ended !!!');
    return created;
  }

  private async hashPassword(password: string): Promise<string> {
    const normalizePassword = password.trim();
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(normalizePassword, salt);
    return hash;
  }

  private signToken(id: ObjectId) {
    return jwt.sign({ userId:id }, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.VALIDATION_CODE_EXPIRETIME),
    });
  }
}


//[ ] Implement FacebookLoginStrategy
export class FacebookLoginStrategy implements LoginStrategy {
  async login(_data: GetUserLoginDTO): Promise<NormalizedUser> {
    throw new Error('Method not implemented.');
  }

}

//[x] Implement EmailLoginStrategy
export class EmailLoginStrategy implements LoginStrategy {
  async login(data: GetUserLoginDTO): Promise<NormalizedUser> {
    const errorFactory = container.get<IErrorFactory>(TYPES.ErrorFactory);
    const userRepositoryProxy = container.get<IRepository<User>>(TYPES.UserRepositoryProxy);
    const select:Select = {
      createdAt:0,
      updatedAt:0,
      isDeleted:0,
    };
    const user = await userRepositoryProxy.findOne({
      email:data.email, 
      isDeleted:false,
    }, select);
    if (!user) {
      errorFactory.createBadError(StaticMessage.LOGIN_FAILD, [{
        field: 'email',
        message: StaticErrors.NOT_FOUND,
        code:1003,
      }]);
    } else if (!(await this.correctPassword(data.password, user.password))) {
      errorFactory.createBadError(StaticMessage.LOGIN_FAILD, [{
        field: 'password',
        message: StaticErrors.INVALID,
        code:1001,
      }]);
    } else if (!user.active) {
      errorFactory.createBadError(StaticMessage.LOGIN_FAILD, [{
        field: 'active',
        message: StaticErrors.EMAIL_NOT_VERIFIED,
        code:2001,
      }]);
    }
    user.password = undefined;
    return user;
  }

  private async correctPassword(candidatePassword:string, userPassword:string) {
    return bcrypt.compare(candidatePassword, userPassword);
  }
}

@injectable()
export class AuthService implements IAuthService {
  private registerStrategies: Map<string, RegisterStrategy>;

  private loginStrategies: Map<string, LoginStrategy>;

  private refreshTokenRepositoryProxy :IRepository<RefreshToken>;

  private errorFactory:IErrorFactory;

  constructor(
  @inject(TYPES.RefreshTokenRepositoryProxy) refreshTokenRepositoryProxy: IRepository<RefreshToken>,
    @inject(TYPES.ErrorFactory) errorFactory: IErrorFactory,
  ) {
    this.registerStrategies = new Map();
    this.loginStrategies = new Map();
    this.registerStrategies.set(Register.EMAIL, new EmailRegisterStrategy());
    this.registerStrategies.set(Register.FACEBOOK, new FacebookRegisterStrategy());
    this.loginStrategies.set(Login.EMAIL, new EmailLoginStrategy());
    this.loginStrategies.set(Login.FACEBOOK, new FacebookLoginStrategy());
    this.refreshTokenRepositoryProxy = refreshTokenRepositoryProxy;
    this.errorFactory = errorFactory;
    logger.info('Auth service initialized');

  }


  async loginUser(strategy: string, data: GetUserLoginDTO): Promise<NormalizedUser> {
    const loginStrategy = this.loginStrategies.get(strategy);
    if (!loginStrategy) {
      this.errorFactory.createBadError(StaticMessage.LOGIN_FAILD, [{
        field: 'strategy',
        message: `Invalid login strategy ${strategy}`,
        code:2000,
      }]);
    }
    const user = await loginStrategy.login(data);
    return user;
  }

  async registerUser(strategy: string, data: RegistrationDTO): Promise<User> {
    logger.debug('Auth service register user running ...');
    const registerStrategy = this.registerStrategies.get(strategy);
    if (!registerStrategy) {
      this.errorFactory.createBadError(StaticMessage.REGISTER_FAILD, [{
        field: 'strategy',
        message: `Invalid register strategy ${strategy}`,
        code:2000,
      }]);
    }
    const user = await registerStrategy.register(data);
    logger.debug('Auth service register user ended !!!');
    return user;
  }
    
  async verifyExpiration(token:string):Promise<RefreshToken> {
    const refreshTokenService = container.get<IRefreshTokenService>(TYPES.RefreshTokenService);
    const refreshToken = await refreshTokenService.getRefreshToken(token);

    if (getValidDate(refreshToken.expiryDate).getTime() < new Date().getTime()) {
      await refreshTokenService.removeRefreshToken(refreshToken);
      this.errorFactory.createBadError(StaticMessage.EXPIRED_R_TOKEN, [{
        message: StaticErrors.TOKEN_ERROR,
        code:3001,
      }]);
    }
    return refreshToken;
  }

  async createRefreshToken(user:NormalizedUser):Promise<string> {
    const expiredAt = new Date();
    expiredAt.setSeconds(
      expiredAt.getSeconds() + Number(process.env.REFRESH_TOKEN_EXPIRETIME),
    );
        
    const token = uuidv4();            
    const refreshToken = {
      token: token,
      userId: user?._id,
      expiryDate: expiredAt,
    } as RefreshToken;
    await this.refreshTokenRepositoryProxy.create(refreshToken);
    return refreshToken.token;
  }

  async verifyUserId(id:ObjectId):Promise<void> {
    const userService = container.get<IUserService>(TYPES.UserService);
    await userService.updateById(id, { active:true });
  }

  signToken(id: ObjectId) {
    return jwt.sign({ userId:id }, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.SERVER_TOKEN_EXPRIRETIME),
    });
  }


    

}