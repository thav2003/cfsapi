import { UserController } from '@controllers';
import CustomRoute from '../CustomRoute';
import container from '../../injector';
import asyncWrap from '@utils/asyncWrapper';
import logger from '@src/logger';
import { isObjectId } from '@utils/utils';
import { ValidationFunction } from '@src/common/middleware';
import {  StaticErrors } from '@src/constants';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';
export default class UserRouter extends CustomRoute<UserController> {
  constructor() {
    super(container.get<UserController>(UserController));
    this.name = 'users';
    this.getAll();
    this.getById();
    this.removeById();
    this.create();
    logger.route('Users route initialized');
  }

  protected getAll(path:string = '/') {
    // this.protectedRoute();
    // this.isRole(['admin']);
    this.router.route(path).get(asyncWrap(this.controller.find.bind(this.controller)));
  }

  protected getById(path:string = '/:id') {
    // this.protectedRoute();
    // this.isRole(['admin', 'user']);
    const validation:ValidationFunction = (values) =>{
      const errors = {} as any;
      if (!isObjectId(values.id)) {
        errors.id = 'Id không hợp lệ';
      }
      
      return errors;

    };
    const mc = this.checkFields('params', ['id'], StaticErrors.INVALID_PARAMETER, validation);
    this.router.route(path).get(mc, asyncWrap(this.controller.get.bind(this.controller)));
  }

  protected removeById(path:string = '/:id') {
    // this.protectedRoute();
    // this.isRole(['admin']);
    const validation:ValidationFunction = (values) =>{
      const errors = {} as any;
      if (!isObjectId(values.id)) {
        errors.id = 'Id không hợp lệ';
      }
      
      return errors;

    };
    const mc = this.checkFields('params', ['id'], StaticErrors.INVALID_PARAMETER, validation);
    this.router.route(path).delete(mc, asyncWrap(this.controller.remove.bind(this.controller)));
  }

  protected create(path:string = '/') {
    // this.protectedRoute();
    // this.isRole(['admin']);
    const validation:ValidationFunction = (values) =>{
      const errors = {} as any;
      if (values.email && !isEmail(values.email)) {
        errors.email = 'Email không hợp lệ';
      }
        
      if (values.password && !isLength(values.password.trim(), { min: 4, max: 20 })) {
        errors.password = 'Mật khẩu từ 4 đến 20 kí tự';
      }
      return errors;

    };
    const mc = this.checkFields('body', ['name', 'email', 'password', 'role'], 'Tạo user thất bại', validation);
    this.router.route(path).post(mc, asyncWrap(this.controller.create.bind(this.controller)));
  }
}