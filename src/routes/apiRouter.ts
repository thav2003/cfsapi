import { Router } from 'express';
import CustomRoute from './CustomRoute';

export default class ApiRouter {

  public router:Router;

  public version:string;

  constructor(version:string) {
    this.router = Router();
    this.version = version;
  }

  public combineRoute(...args:CustomRoute<any>[]):void {
    args.forEach(route=>{
      this.router.use(`/${route.name}`, route.router);
    });
  }

}