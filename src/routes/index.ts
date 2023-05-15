import { Application } from 'express';
import ApiRouter from './apiRouter';
import AuthRouter from './route/authRoute';
import RawConfessionRoute from './route/rawConfessionRoute';
import UserRouter from './route/userRouter';





export default function (app: Application) {
  // Iterate over all our controllers and register our routes
  // const UserControllerInstance = container.get<UserController>(UserController);


  const authRouter = new AuthRouter();
  const userRouter = new UserRouter();
  const rawConfessionRoute = new RawConfessionRoute();

  const apiV1Router = new ApiRouter('v1');
  apiV1Router.combineRoute( userRouter, authRouter, rawConfessionRoute);

  app.use('/api/v1', apiV1Router.router);

}