import { AuthController } from '@controllers';
import CustomRoute from '../CustomRoute';
import container from '../../injector';
import asyncWrap from '@utils/asyncWrapper';
import logger from '@src/logger';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';
import { ValidationFunction } from '@src/common/middleware';
import { StaticMessage } from '@src/constants';
export default class AuthRouter extends CustomRoute<AuthController> {
  constructor() {
    super(container.get<AuthController>(AuthController));
    this.name = 'auth';
    this.login();
    this.register();
    this.refreshToken();
    this.verify();
    logger.route('Auth route initialized');
  }

  protected login():void {
    const validation:ValidationFunction = (values) =>{
      const errors = {} as any;
      if (values.strategy === 'email') {
        if (!values.email || (values.email && !isEmail(values.email))) {
          errors.email = 'Email không hợp lệ';
        }
        if (!values.password || (values.password && !isLength(values.password.trim(), { min: 4, max: 20 }))) {
          errors.password = 'Mật khẩu từ 4 đến 20 kí tự';
        }
      }
      
      return errors;

    };
    const mc = this.checkFields('body', ['strategy'], StaticMessage.LOGIN_FAILD, validation);
    this.router.post('/login', mc, asyncWrap(this.controller.login.bind(this.controller)));
  }

  protected register():void {
    const validation :ValidationFunction = (values) =>{
      const errors = {} as any;

      if (values.strategy === 'email') {
        if ((values.name && !isLength(values.name?.trim(), { min: 4, max: 20 })) || !values.name) {
          errors.name = 'Tên người dùng từ 4 đến 20 kí tự';
        }
        if ((values.email && !isEmail(values.email)) || !values.email) {
          errors.email = 'Email không hợp lệ';
        }
        if ((values.password && !isLength(values.password?.trim(), { min: 4, max: 20 })) || !values.password) {
          errors.password = 'Mật khẩu từ 4 đến 20 kí tự';
        }
        if ((values.passwordConfirm && (values.passwordConfirm !== values.password)) || !values.passwordConfirm) {
          errors.passwordConfirm = 'Mật khẩu xác thực không phù hợp';
        }
      }
      return errors;

    };
    const mc = this.checkFields('body', ['strategy'], StaticMessage.REGISTER_FAILD, validation);
    this.router.post('/register', mc, asyncWrap(this.controller.register.bind(this.controller)));
  }

  protected refreshToken():void {
    const mc = this.checkFields('cookies', ['refreshToken'], StaticMessage.ACCESS_TOKEN_FAILD);
    this.router.get('/refresh', mc, asyncWrap(this.controller.refresh.bind(this.controller)));
  }

  protected verify():void {
    const mc = this.checkFields('params', ['id', 'token'], StaticMessage.VERIFY_EMAIL_FAILD);
    this.router.get('/verify/:id/:token', mc, asyncWrap(this.controller.verify.bind(this.controller)));
  }
}