import {   CookieOptions } from 'express';
import { inject, injectable } from 'inversify';
import { GetUserLoginDTO, RegistrationDTO } from '@dto/authDTO';
import { TYPES } from '@src/types';
import { IAuthService, RegistrationStrategy } from '@services/Interface';
import { JwtPayload, decode } from 'jsonwebtoken';
import { getValidObjectId } from '@utils/utils';
import { CustomResponse, CustomRequest } from '@src/common/common';
import {  StaticErrors, StaticMessage } from '@src/constants';
import { IErrorFactory } from '@src/errors/error.factory';
import container from '@src/injector';
import logger from '@src/logger';

@injectable()
export class AuthController {

  @inject(TYPES.AuthService) private authService: IAuthService;

  public async refresh(req: CustomRequest, res: CustomResponse): Promise<void> {
    const { refreshToken } = req.cookies;
    const checkRefreshToken = await this.authService.verifyExpiration(refreshToken);
    let token = await this.authService.signToken(checkRefreshToken.userId);
    res.sendData(200, StaticMessage.ACCESS_TOKEN_SUCCESS, { accessToken:token });
  }

  public async login(req: CustomRequest, res: CustomResponse): Promise<void> {
    const getUserDTO: GetUserLoginDTO = {
      email: req.body.email,
      password: req.body.password,
    };
    const strategy = req.body.strategy;
    const user = await this.authService.loginUser(strategy, getUserDTO);

    //**generate refresh token for the user  */
    const refreshToken = await this.authService.createRefreshToken(user);
    const token = this.authService.signToken(user._id);


    const cookieOptions:CookieOptions = {
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN)  * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.sendData(200, StaticMessage.LOGIN_SUCCESS, { ...user, accessToken:token });
  }

  public async register(req: CustomRequest, res: CustomResponse): Promise<void> {
    logger.debug('Register controller running ...');
    const data: RegistrationDTO = req.body;
    const strategy:RegistrationStrategy = req.body.strategy;
    await this.authService.registerUser(strategy, data);
    logger.debug('Register controller ended !!!');
    res.sendData(201, StaticMessage.REGISTER_SUCCESS);
  }
  
  public async verify(req: CustomRequest, res: CustomResponse): Promise<void> {
    const { token, id } = req.params;
    // decode the token
    const decoded = decode(token) as JwtPayload ;

    if (decoded.exp < Date.now() / 1000) {
      const errorFactory = container.get<IErrorFactory>(TYPES.ErrorFactory);
      errorFactory.createBadError(StaticMessage.EXPIRED_VERIFY, [{
        message: StaticErrors.TOKEN_ERROR,
        code:3001,
      }]);
    } else {
      await this.authService.verifyUserId(getValidObjectId(id));
      res.redirect(process.env.VERIFY_SUCCESS_URL);
    }
  }
}