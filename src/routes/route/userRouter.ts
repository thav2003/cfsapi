import { UserController } from '@controllers';
import CustomRoute from '../CustomRoute';
import container from '../../injector';
import asyncWrap from '@utils/asyncWrapper';
import logger from '@src/logger';
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
    this.router.route(path).get(asyncWrap(this.controller.get.bind(this.controller)));
  }

  protected removeById(path:string = '/') {
    // this.protectedRoute();
    // this.isRole(['admin']);
    this.router.route(path).delete(asyncWrap(this.controller.remove.bind(this.controller)));
  }

  protected create(path:string = '/') {
    this.protectedRoute();
    this.isRole(['admin']);
    this.router.route(path).post(asyncWrap(this.controller.create.bind(this.controller)));
  }
}