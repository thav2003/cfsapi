import { Router } from 'express';
import checkJwt from '@middleware/checkJwt';
import checkRole from '@middleware/checkRole';
import asyncWrap from '@utils/asyncWrapper';
import { ICustomRoute } from './ICustomRoute';
import checkFields from '@middleware/checkFields';
import { ValidationFunction } from '@src/common/middleware';


export default class CustomRoute<T> implements ICustomRoute {
    
  public router:Router;

  protected controller:T;

  public name:string;

  protected constructor(controller:T) {
    this.controller = controller;
    this.router = Router();
  }

  protectedRoute() {
    this.router.use(asyncWrap(checkJwt));
  }

  isRole(role:Array<string>) {
    this.router.use(checkRole(role));
  }

  checkFields(type: 'body' | 'query' | 'cookies' | 'params', fields: string[], message:string, validation?:ValidationFunction) {
    return checkFields(type, fields, message, validation);
  }
} 
