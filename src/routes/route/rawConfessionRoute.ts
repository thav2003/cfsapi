import { ConfessionController } from '@controllers';
import CustomRoute from '../CustomRoute';
import container from '@src/injector';
import asyncWrap from '@utils/asyncWrapper';
import logger from '@src/logger';
export default class RawConfessionRoute extends CustomRoute<ConfessionController> {
  constructor() {
    super(container.get<ConfessionController>(ConfessionController));
    this.name = 'raw-confessions';
    this.getAll();
    // this.getById();
    this.create();
    logger.route('Raw-confessions route initialized');
  }

  // protected getById(path:string = '/:id') {
  //   // this.protectedRoute();
  //   this.router.route(path).get(asyncWrap(this.controller.getRawById.bind(this.controller)));
  // }

  protected getAll(path:string = '/') {
    // this.protectedRoute();
    this.router.route(path).get(asyncWrap(this.controller.findRaws.bind(this.controller)));
  }

  protected create(path:string = '/') {
    this.protectedRoute();
    this.router.route(path).post(asyncWrap(this.controller.createRaw.bind(this.controller)));
  }
}