
/**
 * InversifyJS need to use the type as identifiers at runtime.
 * We use symbols as identifiers but you can also use classes and or string literals.
 */
export const TYPES = {
  //TODO TYPES REDIS 
  //ADD Redis
  Redis: Symbol('Redis'),

  //TODO TYPES Controller 
  //ADD UserController
  UserController: Symbol('UserController'),
  //ADD AuthController
  AuthController: Symbol('AuthController'),
  //ADD ConfessionController
  ConfessionController: Symbol('ConfessionController'),

  //TODO TYPES RepositoryProxy 
  //ADD RefreshTokenRepositoryProxy
  RefreshTokenRepositoryProxy: Symbol('RefreshTokenRepositoryProxy'),
  //ADD UserRepositoryProxy
  UserRepositoryProxy: Symbol('UserRepositoryProxy'),
  //ADD ConfessionRepositoryProxy
  ConfessionRepositoryProxy: Symbol('ConfessionRepositoryProxy'),
  //ADD RawConfessionRepositoryProxy
  RawConfessionRepositoryProxy: Symbol('RawConfessionRepositoryProxy'),

  //TODO TYPES Repository
  //ADD RefreshTokenRepository
  RefreshTokenRepository: Symbol('RefreshTokenRepository'),
  //ADD UserRepository
  UserRepository: Symbol('UserRepository'),
  //ADD ConfessionRepository
  ConfessionRepository: Symbol('ConfessionRepository'),
  //ADD RawConfessionRepository
  RawConfessionRepository: Symbol('RawConfessionRepository'),

  //TODO TYPES Service
  //ADD UserService
  UserService: Symbol('UserService'),
  //ADD AuthService
  AuthService: Symbol('AuthService'),
  //ADD ConfessionService
  ConfessionService:Symbol('ConfessionService'),
  //ADD RefreshTokenService
  RefreshTokenService:Symbol('RefreshTokenService'),
  //ADD TinderService
  TinderService:Symbol('TinderService'),

  //TODO TYPES Algorithm
  //ADD TinderAlgorithm
  TinderAlgorithm:Symbol('TinderAlgorithm'),

  //TODO TYPES ErrorFactory
  //ADD ErrorFactory
  ErrorFactory:Symbol('ErrorFactory'),

};