
import { TYPES } from '@src/types';
import { Container, interfaces } from 'inversify';

//import model

import { Confession, RawConfession, RefreshToken, User } from '@models';

//import controller
import { UserController, AuthController, ConfessionController } from '@controllers';

//import services
import { UserService, AuthService, ConfessionService, TinderService, RefreshTokenService } from '@services/Implement';
import { IUserService, IAuthService, IConfessionService, ITinderService, IRefreshTokenService } from '@services/Interface';

//import repository
import { IRepository } from '@core/repository/IRepository';
import Repository from '@core/repository/repository';
import RepositoryProxy  from '@core/repository/repositoryProxy';

//import redis
import { IRedisClient, Redis } from './redisClient';

import logger from './logger';
import { ITinderAlgorithm, TinderAlgorithm } from './algorithm/KnnAlgorithm';
import { ErrorFactory, IErrorFactory } from './errors/error.factory';




// const container = new Container({ defaultScope: 'Singleton' });
const container = new Container();

//Error factory
container.bind<IErrorFactory>(TYPES.ErrorFactory).to(ErrorFactory).inRequestScope();

// // Đăng kí Redis vào container
container.bind<IRedisClient>(TYPES.Redis).to(Redis).inSingletonScope();

//controller
container.bind(UserController).to(UserController).inRequestScope();
container.bind(AuthController).to(AuthController).inRequestScope();
container.bind(ConfessionController).to(ConfessionController).inRequestScope();

// //repository

container.bind<IRepository<User>>(TYPES.UserRepository)
  .toDynamicValue((_context: interfaces.Context) => {
    const collectionName = 'users';
    const errorFactory = container.get<IErrorFactory>(TYPES.ErrorFactory);
    logger.info( collectionName + ' repository initialized');
    return new Repository<User>(collectionName, errorFactory);
  }).inTransientScope();

container.bind<IRepository<RefreshToken>>(TYPES.RefreshTokenRepository)
  .toDynamicValue((_context: interfaces.Context) => {
    const collectionName = 'refresh_tokens';
    const errorFactory = container.get<IErrorFactory>(TYPES.ErrorFactory);
    logger.info( collectionName + ' repository initialized');
    return new Repository<RefreshToken>(collectionName, errorFactory);
  }).inTransientScope();
container.bind<IRepository<RawConfession>>(TYPES.RawConfessionRepository)
  .toDynamicValue((_context: interfaces.Context) => {
    const collectionName = 'raw_confessions';
    const errorFactory = container.get<IErrorFactory>(TYPES.ErrorFactory);
    logger.info( collectionName + ' repository initialized');
    return new Repository<RawConfession>(collectionName, errorFactory);
  }).inTransientScope();

container.bind<IRepository<Confession>>(TYPES.ConfessionRepository)
  .toDynamicValue((_context: interfaces.Context) => {
    const collectionName = 'confessions';
    const errorFactory = container.get<IErrorFactory>(TYPES.ErrorFactory);
    logger.info( collectionName + ' repository initialized');
    return new Repository<Confession>(collectionName, errorFactory);
  }).inTransientScope();


// //proxy
container.bind<IRepository<User>>(TYPES.UserRepositoryProxy)
  .toDynamicValue((context: interfaces.Context) => {
    const repository = context.container.get<IRepository<User>>(TYPES.UserRepository);
    logger.info('user repository proxy initialized');
    const repositoryProxy = new RepositoryProxy<User>(repository);
    return repositoryProxy;
   
  }).inTransientScope();

container.bind<IRepository<RefreshToken>>(TYPES.RefreshTokenRepositoryProxy)
  .toDynamicValue((context: interfaces.Context) => {
    const repository = context.container.get<IRepository<RefreshToken>>(TYPES.RefreshTokenRepository);
    logger.info('refresh_token repository proxy initialized');
    const repositoryProxy = new RepositoryProxy<RefreshToken>(repository);
    return repositoryProxy;
  }).inTransientScope();

container.bind<IRepository<RawConfession>>(TYPES.RawConfessionRepositoryProxy)
  .toDynamicValue((context: interfaces.Context) => {
    const repository = context.container.get<IRepository<RawConfession>>(TYPES.RawConfessionRepository);
    logger.info('raw_confessions proxy initialized');
    const repositoryProxy = new RepositoryProxy<RawConfession>(repository);
    return repositoryProxy;
  }).inTransientScope();

//service
container.bind<IUserService>(TYPES.UserService).to(UserService).inTransientScope();
container.bind<IAuthService>(TYPES.AuthService).to(AuthService).inTransientScope();
container.bind<IRefreshTokenService>(TYPES.RefreshTokenService).to(RefreshTokenService).inTransientScope();
container.bind<IConfessionService>(TYPES.ConfessionService).to(ConfessionService).inTransientScope();
container.bind<ITinderService>(TYPES.TinderService).to(TinderService);

//Algorithm
container.bind<ITinderAlgorithm>(TYPES.TinderAlgorithm).to(TinderAlgorithm).inTransientScope();



/*
const repository = container.resolve<IRepository<User>>(TYPES.Repository);
const repository = container.resolve<IRepository<RefreshToken>>(TYPES.Repository);
const repositoryProxy = container.resolve<IRepositoryProxy<MyModel>>(TYPES.RepositoryProxy);
*/

export default container;